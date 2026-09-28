
import { useEffect, useState } from 'react'
import {
  PackageCheck,
  Plus,
  Truck,
  MapPin,
  Navigation,
  ClipboardList,
  X,
  FileText,
  CalendarDays,
  Search,
  CheckCircle2,
  Clock3,
  UserRound,
  Package,
  Printer
} from 'lucide-react'
import { supabase } from '../services/supabase'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Entregas() {
  const [clientes, setClientes] = useState([])
  const [entregadores, setEntregadores] = useState([])
  const [produtos, setProdutos] = useState([])
  const [entregas, setEntregas] = useState([])

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarPdf, setMostrarPdf] = useState(false)

  const [salvando, setSalvando] = useState(false)
  const [gerandoPdf, setGerandoPdf] = useState(false)

  const [clienteId, setClienteId] = useState('')
  const [entregadorId, setEntregadorId] = useState('')
  const [observacao, setObservacao] = useState('')

  const [produtosSelecionados, setProdutosSelecionados] =
    useState([])

  const [produtoAtual, setProdutoAtual] = useState('')
  const [quantidadeAtual, setQuantidadeAtual] = useState('')

  const [tipoPdf, setTipoPdf] = useState('dia')
  const [dataPdf, setDataPdf] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [entregaPdfId, setEntregaPdfId] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const [
      clientesResult,
      entregadoresResult,
      produtosResult,
      entregasResult
    ] = await Promise.all([
      supabase
        .from('clientes')
        .select('*')
        .order('nome'),

      supabase
        .from('entregadores')
        .select('*')
        .eq('ativo', true)
        .order('nome'),

      supabase
        .from('produtos')
        .select('*')
        .order('nome'),

      supabase
        .from('entregas')
        .select(`
          *,
          cliente:clientes(*),
          entregador:entregadores(*),
          itens_entrega(
            *,
            produto:produtos(*)
          )
        `)
        .order('created_at', {
          ascending: false
        })
    ])

    if (clientesResult.error) {
      console.error(
        'Erro ao carregar clientes:',
        clientesResult.error
      )
    }

    if (entregadoresResult.error) {
      console.error(
        'Erro ao carregar entregadores:',
        entregadoresResult.error
      )
    }

    if (produtosResult.error) {
      console.error(
        'Erro ao carregar produtos:',
        produtosResult.error
      )
    }

    if (entregasResult.error) {
      console.error(
        'Erro ao carregar entregas:',
        entregasResult.error
      )
    }

    setClientes(clientesResult.data || [])
    setEntregadores(entregadoresResult.data || [])
    setProdutos(produtosResult.data || [])
    setEntregas(entregasResult.data || [])
  }

  function abrirFormulario() {
    setClienteId('')
    setEntregadorId('')
    setObservacao('')
    setProdutosSelecionados([])
    setProdutoAtual('')
    setQuantidadeAtual('')
    setMostrarFormulario(true)
  }

  function fecharFormulario() {
    setMostrarFormulario(false)
  }

  function adicionarProduto() {
    if (!produtoAtual) {
      alert('Selecione um produto.')
      return
    }

    const quantidade = Number(quantidadeAtual)

    if (!quantidade || quantidade <= 0) {
      alert('Digite uma quantidade válida.')
      return
    }

    const produto = produtos.find(
      (item) => item.id === produtoAtual
    )

    if (!produto) {
      return
    }

    const existente = produtosSelecionados.find(
      (item) => item.produto_id === produto.id
    )

    if (existente) {
      setProdutosSelecionados(
        produtosSelecionados.map((item) =>
          item.produto_id === produto.id
            ? {
                ...item,
                quantidade:
                  Number(item.quantidade) +
                  quantidade
              }
            : item
        )
      )
    } else {
      setProdutosSelecionados([
        ...produtosSelecionados,
        {
          produto_id: produto.id,
          produto,
          quantidade
        }
      ])
    }

    setProdutoAtual('')
    setQuantidadeAtual('')
  }

  function removerProduto(produtoId) {
    setProdutosSelecionados(
      produtosSelecionados.filter(
        (item) => item.produto_id !== produtoId
      )
    )
  }

  async function salvarEntrega(event) {
    event.preventDefault()

    if (!clienteId) {
      alert('Selecione um cliente.')
      return
    }

    if (!entregadorId) {
      alert('Selecione um entregador.')
      return
    }

    if (produtosSelecionados.length === 0) {
      alert('Adicione pelo menos um produto.')
      return
    }

    setSalvando(true)

    const { data: entrega, error: entregaError } =
      await supabase
        .from('entregas')
        .insert([
          {
            cliente_id: clienteId,
            entregador_id: entregadorId,
            observacao:
              observacao.trim() || null
          }
        ])
        .select()
        .single()

    if (entregaError) {
      console.error(
        'Erro ao salvar entrega:',
        entregaError
      )

      alert('Não foi possível salvar a entrega.')
      setSalvando(false)
      return
    }

    const itens = produtosSelecionados.map(
      (item) => ({
        entrega_id: entrega.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade
      })
    )

    const { error: itensError } =
      await supabase
        .from('itens_entrega')
        .insert(itens)

    if (itensError) {
      console.error(
        'Erro ao salvar itens:',
        itensError
      )

      await supabase
        .from('entregas')
        .delete()
        .eq('id', entrega.id)

      alert(
        'Não foi possível salvar os produtos da entrega.'
      )

      setSalvando(false)
      return
    }

    setSalvando(false)
    setMostrarFormulario(false)

    carregarDados()
  }

  async function marcarComoEntregue(id) {
    const confirmar = window.confirm(
      'Marcar esta entrega como concluída?'
    )

    if (!confirmar) {
      return
    }

    const { error } = await supabase
      .from('entregas')
      .update({
        status: 'entregue'
      })
      .eq('id', id)

    if (error) {
      console.error(
        'Erro ao atualizar entrega:',
        error
      )

      alert(
        'Não foi possível atualizar a entrega.'
      )

      return
    }

    carregarDados()
  }

  function formatarData(data) {
    if (!data) {
      return '-'
    }

    const [ano, mes, dia] =
      data.split('-')

    return `${dia}/${mes}/${ano}`
  }

  function formatarDataHora(data) {
    if (!data) {
      return '-'
    }

    const dataObj = new Date(data)

    return dataObj.toLocaleString(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    )
  }

  function obterEntregasDoDia(data) {
    return entregas.filter(
      (entrega) =>
        entrega.data_entrega === data
    )
  }

  function abrirModalPdf() {
    const entregasDoDia =
      obterEntregasDoDia(dataPdf)

    setEntregaPdfId(
      entregasDoDia[0]?.id || ''
    )

    setTipoPdf('dia')
    setMostrarPdf(true)
  }

  function fecharModalPdf() {
    setMostrarPdf(false)
  }

  function criarCabecalhoPdf(doc, titulo) {
    doc.setFillColor(24, 49, 39)

    doc.rect(
      0,
      0,
      210,
      33,
      'F'
    )

    doc.setTextColor(
      255,
      253,
      248
    )

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.setFontSize(18)

    doc.text(
      'PADARIA DIAS',
      15,
      14
    )

    doc.setFontSize(9)

    doc.setFont(
      'helvetica',
      'normal'
    )

    doc.text(
      'Sistema de Entregas',
      15,
      21
    )

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.setFontSize(12)

    doc.text(
      titulo,
      195,
      18,
      {
        align: 'right'
      }
    )

    doc.setTextColor(
      70,
      80,
      74
    )
  }

  function adicionarRodape(doc) {
    const paginas =
      doc.internal.getNumberOfPages()

    for (
      let i = 1;
      i <= paginas;
      i++
    ) {
      doc.setPage(i)

      const altura =
        doc.internal.pageSize.height

      doc.setDrawColor(
        220,
        216,
        207
      )

      doc.line(
        15,
        altura - 14,
        195,
        altura - 14
      )

      doc.setFont(
        'helvetica',
        'normal'
      )

      doc.setFontSize(8)

      doc.setTextColor(
        130,
        135,
        130
      )

      doc.text(
        'Padaria Dias · Sistema de Entregas',
        15,
        altura - 8
      )

      doc.text(
        `Página ${i} de ${paginas}`,
        195,
        altura - 8,
        {
          align: 'right'
        }
      )
    }
  }

  function gerarPdfDoDia(doc, lista) {
    criarCabecalhoPdf(
      doc,
      'ENTREGAS DO DIA'
    )

    doc.setFont(
      'helvetica',
      'normal'
    )

    doc.setFontSize(9)

    doc.text(
      `Data: ${formatarData(dataPdf)}`,
      15,
      43
    )

    doc.text(
      `Total de entregas: ${lista.length}`,
      195,
      43,
      {
        align: 'right'
      }
    )

    let y = 52

    lista.forEach(
      (entrega, index) => {
        const cliente =
          entrega.cliente

        const entregador =
          entrega.entregador

        doc.setFillColor(
          246,
          243,
          235
        )

        doc.roundedRect(
          15,
          y,
          180,
          9,
          2,
          2,
          'F'
        )

        doc.setTextColor(
          42,
          58,
          49
        )

        doc.setFont(
          'helvetica',
          'bold'
        )

        doc.setFontSize(10)

        doc.text(
          `${index + 1}. ${cliente?.nome || 'Cliente'}`,
          19,
          y + 6
        )

        doc.setFont(
          'helvetica',
          'normal'
        )

        doc.setFontSize(8)

        doc.text(
          `Entregador: ${entregador?.nome || '-'}`,
          191,
          y + 6,
          {
            align: 'right'
          }
        )

        y += 14

        doc.setTextColor(
          90,
          98,
          92
        )

        doc.setFontSize(8)

        doc.text(
          `Endereço: ${cliente?.endereco || '-'}`,
          19,
          y
        )

        y += 5

        if (cliente?.bairro) {
          doc.text(
            `Bairro: ${cliente.bairro}`,
            19,
            y
          )

          y += 5
        }

        if (cliente?.referencia) {
          doc.text(
            `Referência: ${cliente.referencia}`,
            19,
            y
          )

          y += 5
        }

        const produtosTexto =
          (entrega.itens_entrega || [])
            .map(
              (item) =>
                `${item.quantidade}x ${item.produto?.nome || ''}`
            )
            .join(' · ')

        doc.text(
          `Produtos: ${produtosTexto || '-'}`,
          19,
          y
        )

        y += 5

        doc.text(
          `Status: ${
            entrega.status === 'entregue'
              ? 'Entregue'
              : 'Pendente'
          }`,
          19,
          y
        )

        y += 5

        if (entrega.observacao) {
          doc.text(
            `Obs.: ${entrega.observacao}`,
            19,
            y
          )

          y += 5
        }

        y += 5

        if (y > 270) {
          doc.addPage()

          criarCabecalhoPdf(
            doc,
            'ENTREGAS DO DIA'
          )

          y = 43
        }
      }
    )
  }

  function gerarPdfIndividual(doc, entrega) {
    const cliente =
      entrega.cliente

    const entregador =
      entrega.entregador

    criarCabecalhoPdf(
      doc,
      'ORDEM DE ENTREGA'
    )

    doc.setFont(
      'helvetica',
      'normal'
    )

    doc.setFontSize(8)

    doc.setTextColor(
      130,
      135,
      130
    )

    doc.text(
      `Gerado em: ${formatarDataHora(
        new Date().toISOString()
      )}`,
      195,
      43,
      {
        align: 'right'
      }
    )

    doc.setTextColor(
      50,
      62,
      54
    )

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.setFontSize(14)

    doc.text(
      cliente?.nome || 'Cliente',
      15,
      57
    )

    doc.setFont(
      'helvetica',
      'normal'
    )

    doc.setFontSize(9)

    doc.text(
      `Data da entrega: ${formatarData(
        entrega.data_entrega
      )}`,
      15,
      65
    )

    doc.text(
      `Entregador: ${
        entregador?.nome || '-'
      }`,
      195,
      65,
      {
        align: 'right'
      }
    )

    autoTable(doc, {
      startY: 76,

      theme: 'grid',

      head: [
        [
          'INFORMAÇÃO',
          'DETALHE'
        ]
      ],

      body: [
        [
          'Endereço',
          cliente?.endereco || '-'
        ],
        [
          'Bairro',
          cliente?.bairro || '-'
        ],
        [
          'Telefone',
          cliente?.telefone || '-'
        ],
        [
          'Referência',
          cliente?.referencia || '-'
        ],
        [
          'Status',
          entrega.status === 'entregue'
            ? 'Entregue'
            : 'Pendente'
        ]
      ],

      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 6,
        textColor: [
          65,
          73,
          68
        ]
      },

      headStyles: {
        fillColor: [
          24,
          49,
          39
        ],
        textColor: [
          255,
          253,
          248
        ],
        fontStyle: 'bold'
      },

      alternateRowStyles: {
        fillColor: [
          248,
          246,
          240
        ]
      },

      columnStyles: {
        0: {
          cellWidth: 40,
          fontStyle: 'bold'
        },
        1: {
          cellWidth: 140
        }
      }
    })

    let finalY =
      doc.lastAutoTable.finalY + 15

    doc.setFont(
      'helvetica',
      'bold'
    )

    doc.setFontSize(11)

    doc.setTextColor(
      42,
      58,
      49
    )

    doc.text(
      'PRODUTOS',
      15,
      finalY
    )

    finalY += 5

    autoTable(doc, {
      startY: finalY,

      theme: 'grid',

      head: [
        [
          'Produto',
          'Categoria',
          'Quantidade'
        ]
      ],

      body:
        (entrega.itens_entrega || []).map(
          (item) => [
            item.produto?.nome || '-',
            item.produto?.categoria || '-',
            String(item.quantidade)
          ]
        ),

      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 6,
        textColor: [
          65,
          73,
          68
        ]
      },

      headStyles: {
        fillColor: [
          45,
          82,
          65
        ],
        textColor: [
          255,
          253,
          248
        ],
        fontStyle: 'bold'
      },

      alternateRowStyles: {
        fillColor: [
          248,
          246,
          240
        ]
      }
    })

    finalY =
      doc.lastAutoTable.finalY + 15

    if (entrega.observacao) {
      doc.setFont(
        'helvetica',
        'bold'
      )

      doc.setFontSize(11)

      doc.text(
        'OBSERVAÇÃO',
        15,
        finalY
      )

      finalY += 7

      doc.setFont(
        'helvetica',
        'normal'
      )

      doc.setFontSize(9)

      doc.setFillColor(
        251,
        245,
        229
      )

      doc.roundedRect(
        15,
        finalY - 5,
        180,
        22,
        2,
        2,
        'F'
      )

      doc.setTextColor(
        95,
        92,
        78
      )

      const linhas =
        doc.splitTextToSize(
          entrega.observacao,
          165
        )

      doc.text(
        linhas,
        20,
        finalY + 3
      )
    }
  }

  async function gerarPdf() {
    setGerandoPdf(true)

    try {
      let doc

      if (tipoPdf === 'dia') {
        const lista =
          obterEntregasDoDia(dataPdf)

        if (lista.length === 0) {
          alert(
            'Não existem entregas para a data selecionada.'
          )

          setGerandoPdf(false)
          return
        }

        doc = new jsPDF()

        gerarPdfDoDia(
          doc,
          lista
        )

        adicionarRodape(doc)

        doc.save(
          `entregas-${dataPdf}.pdf`
        )
      } else {
        const entrega =
          entregas.find(
            (item) =>
              item.id === entregaPdfId
          )

        if (!entrega) {
          alert(
            'Selecione uma entrega.'
          )

          setGerandoPdf(false)
          return
        }

        doc = new jsPDF()

        gerarPdfIndividual(
          doc,
          entrega
        )

        adicionarRodape(doc)

        const nomeArquivo =
          (entrega.cliente?.nome ||
            'entrega')
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/gi,
              '-'
            )

        doc.save(
          `entrega-${nomeArquivo}.pdf`
        )
      }

      setMostrarPdf(false)

    } catch (error) {
      console.error(
        'Erro ao gerar PDF:',
        error
      )

      alert(
        'Não foi possível gerar o PDF.'
      )
    }

    setGerandoPdf(false)
  }

  const entregasDoDia =
    obterEntregasDoDia(dataPdf)

  const pendentes =
    entregas.filter(
      (entrega) =>
        entrega.status !== 'entregue'
    ).length

  const concluidas =
    entregas.filter(
      (entrega) =>
        entrega.status === 'entregue'
    ).length

  return (
    <div className="page-container">

      {/* =================================================
          CABEÇALHO
      ================================================= */}

      <div className="page-header">

        <div>

          <span className="page-eyebrow">
            OPERAÇÃO
          </span>

          <h1>
            Entregas
          </h1>

          <p>
            Organize e acompanhe as entregas da Padaria Dias.
          </p>

        </div>

        <div className="delivery-header-actions">

          <button
            className="secondary-button"
            onClick={abrirModalPdf}
          >
            <FileText size={16} />
            Gerar PDF
          </button>

          <button
            className="primary-button"
            onClick={abrirFormulario}
          >
            <Plus size={16} />
            Nova entrega
          </button>

        </div>

      </div>

      {/* =================================================
          ESTATÍSTICAS
      ================================================= */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon green">
            <ClipboardList size={19} />
          </div>

          <div>
            <span>Total de entregas</span>
            <strong>
              {entregas.length}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            <Clock3 size={19} />
          </div>

          <div>
            <span>Pendentes</span>
            <strong>
              {pendentes}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon blue">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Entregues</span>
            <strong>
              {concluidas}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          LISTA
      ================================================= */}

      <div className="section-header">

        <div>

          <h2>
            Entregas cadastradas
          </h2>

          <span>
            Acompanhe os pedidos e seus respectivos entregadores.
          </span>

        </div>

      </div>

      {entregas.length === 0 ? (

        <div className="empty-state">

          <div className="empty-state-icon">
            <PackageCheck size={24} />
          </div>

          <h3>
            Nenhuma entrega cadastrada
          </h3>

          <p>
            Cadastre a primeira entrega para começar a organizar a operação.
          </p>

          <button
            className="primary-button"
            onClick={abrirFormulario}
          >
            <Plus size={16} />
            Criar primeira entrega
          </button>

        </div>

      ) : (

        <div className="deliveries-list">

          {entregas.map((entrega) => {

            const cliente =
              entrega.cliente

            const entregador =
              entrega.entregador

            const entregue =
              entrega.status === 'entregue'

            return (
              <div
                className={`delivery-card ${
                  entregue
                    ? 'delivery-completed'
                    : ''
                }`}
                key={entrega.id}
              >

                <div className="delivery-card-top">

                  <div className="delivery-client">

                    <div className="client-avatar">
                      {cliente?.nome
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div>

                      <span>
                        CLIENTE
                      </span>

                      <h3>
                        {cliente?.nome ||
                          'Cliente'}
                      </h3>

                    </div>

                  </div>

                  <div
                    className={`delivery-status ${
                      entregue
                        ? 'delivered'
                        : 'pending'
                    }`}
                  >

                    {entregue ? (
                      <>
                        <CheckCircle2
                          size={13}
                        />
                        Entregue
                      </>
                    ) : (
                      <>
                        <Clock3
                          size={13}
                        />
                        Pendente
                      </>
                    )}

                  </div>

                </div>

                <div className="delivery-divider"></div>

                <div className="delivery-info-grid">

                  <div className="delivery-info">

                    <div className="delivery-info-icon">
                      <MapPin size={14} />
                    </div>

                    <div>

                      <span>
                        ENDEREÇO
                      </span>

                      <strong>
                        {cliente?.endereco ||
                          '-'}
                      </strong>

                      {cliente?.bairro && (
                        <small>
                          {cliente.bairro}
                        </small>
                      )}

                    </div>

                  </div>

                  <div className="delivery-info">

                    <div className="delivery-info-icon">
                      <Truck size={14} />
                    </div>

                    <div>

                      <span>
                        ENTREGADOR
                      </span>

                      <strong>
                        {entregador?.nome ||
                          '-'}
                      </strong>

                    </div>

                  </div>

                </div>

                {cliente?.referencia && (

                  <div className="delivery-reference">

                    <Navigation size={13} />

                    <div>

                      <span>
                        REFERÊNCIA
                      </span>

                      <p>
                        {cliente.referencia}
                      </p>

                    </div>

                  </div>

                )}

                <div className="delivery-products">

                  <div className="delivery-products-title">

                    <Package size={14} />

                    <span>
                      PRODUTOS
                    </span>

                  </div>

                  <div className="delivery-product-list">

                    {(entrega.itens_entrega || [])
                      .map((item) => (

                        <div
                          className="delivery-product"
                          key={item.id}
                        >

                          <strong>
                            {item.quantidade}x
                          </strong>

                          <span>
                            {item.produto?.nome}
                          </span>

                        </div>

                      ))}

                  </div>

                </div>

                {entrega.observacao && (

                  <div className="delivery-observation">

                    <span>
                      OBSERVAÇÃO
                    </span>

                    <p>
                      {entrega.observacao}
                    </p>

                  </div>

                )}

                <div className="delivery-card-footer">

                  <div className="delivery-date">

                    <CalendarDays size={13} />

                    <span>
                      {formatarData(
                        entrega.data_entrega
                      )}
                    </span>

                  </div>

                  {!entregue && (

                    <button
                      className="complete-button"
                      onClick={() =>
                        marcarComoEntregue(
                          entrega.id
                        )
                      }
                    >
                      <CheckCircle2
                        size={14}
                      />
                      Marcar como entregue
                    </button>

                  )}

                </div>

              </div>
            )
          })}

        </div>

      )}

      {/* =================================================
          MODAL — NOVA ENTREGA
      ================================================= */}

      {mostrarFormulario && (

        <div className="modal-overlay">

          <div className="modal-card delivery-modal">

            <div className="modal-header">

              <div>

                <span className="page-eyebrow">
                  NOVA OPERAÇÃO
                </span>

                <h2>
                  Nova entrega
                </h2>

                <p>
                  Informe os dados da entrega.
                </p>

              </div>

              <button
                className="close-button"
                onClick={fecharFormulario}
              >
                <X size={18} />
              </button>

            </div>

            <form onSubmit={salvarEntrega}>

              <div className="form-group">

                <label>
                  Cliente
                </label>

                <div className="input-with-icon">

                  <UserRound size={15} />

                  <select
                    value={clienteId}
                    onChange={(event) =>
                      setClienteId(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Selecione o cliente
                    </option>

                    {clientes.map(
                      (cliente) => (
                        <option
                          key={cliente.id}
                          value={cliente.id}
                        >
                          {cliente.nome}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              <div className="form-group">

                <label>
                  Entregador
                </label>

                <div className="input-with-icon">

                  <Truck size={15} />

                  <select
                    value={entregadorId}
                    onChange={(event) =>
                      setEntregadorId(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Selecione o entregador
                    </option>

                    {entregadores.map(
                      (entregador) => (
                        <option
                          key={entregador.id}
                          value={entregador.id}
                        >
                          {entregador.nome}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              <div className="form-group">

                <label>
                  Produto
                </label>

                <div className="delivery-product-add">

                  <div className="input-with-icon">

                    <Package size={15} />

                    <select
                      value={produtoAtual}
                      onChange={(event) =>
                        setProdutoAtual(
                          event.target.value
                        )
                      }
                    >

                      <option value="">
                        Selecione o produto
                      </option>

                      {produtos.map(
                        (produto) => (
                          <option
                            key={produto.id}
                            value={produto.id}
                          >
                            {produto.nome}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <input
                    type="number"
                    min="1"
                    placeholder="Qtd."
                    value={quantidadeAtual}
                    onChange={(event) =>
                      setQuantidadeAtual(
                        event.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="add-product-button"
                    onClick={adicionarProduto}
                  >
                    <Plus size={16} />
                  </button>

                </div>

              </div>

              {produtosSelecionados.length > 0 && (

                <div className="selected-products">

                  <div className="selected-products-title">
                    Produtos da entrega
                  </div>

                  {produtosSelecionados.map(
                    (item) => (

                      <div
                        className="selected-product"
                        key={item.produto_id}
                      >

                        <div>

                          <strong>
                            {item.quantidade}x
                          </strong>

                          <span>
                            {item.produto.nome}
                          </span>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removerProduto(
                              item.produto_id
                            )
                          }
                        >
                          <X size={14} />
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

              <div className="form-group">

                <label>
                  Observação
                </label>

                <div className="input-with-icon textarea-icon">

                  <ClipboardList size={15} />

                  <textarea
                    value={observacao}
                    onChange={(event) =>
                      setObservacao(
                        event.target.value
                      )
                    }
                    placeholder="Alguma observação para esta entrega..."
                  />

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={fecharFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={salvando}
                >
                  {salvando ? (
                    'Salvando...'
                  ) : (
                    <>
                      <PackageCheck size={15} />
                      Criar entrega
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          MODAL — PDF
      ================================================= */}

      {mostrarPdf && (

        <div className="modal-overlay">

          <div className="modal-card pdf-modal">

            <div className="modal-header">

              <div>

                <span className="page-eyebrow">
                  DOCUMENTOS
                </span>

                <h2>
                  Gerar PDF
                </h2>

                <p>
                  Escolha quais entregas deseja imprimir.
                </p>

              </div>

              <button
                className="close-button"
                onClick={fecharModalPdf}
              >
                <X size={18} />
              </button>

            </div>

            {/* TIPO */}

            <div className="pdf-type-grid">

              <button
                type="button"
                className={`pdf-type-card ${
                  tipoPdf === 'dia'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setTipoPdf('dia')
                }
              >

                <CalendarDays size={20} />

                <div>

                  <strong>
                    Entregas do dia
                  </strong>

                  <span>
                    Gerar uma lista com todas as entregas.
                  </span>

                </div>

              </button>

              <button
                type="button"
                className={`pdf-type-card ${
                  tipoPdf === 'individual'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setTipoPdf('individual')
                }
              >

                <FileText size={20} />

                <div>

                  <strong>
                    Uma entrega
                  </strong>

                  <span>
                    Gerar uma ordem de entrega específica.
                  </span>

                </div>

              </button>

            </div>

            {/* DATA */}

            {tipoPdf === 'dia' && (

              <div className="form-group">

                <label>
                  Data das entregas
                </label>

                <div className="input-with-icon">

                  <CalendarDays size={15} />

                  <input
                    type="date"
                    value={dataPdf}
                    onChange={(event) =>
                      setDataPdf(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="pdf-result-info">

                  <Search size={14} />

                  <span>
                    {entregasDoDia.length}
                    {' '}
                    {entregasDoDia.length === 1
                      ? 'entrega encontrada'
                      : 'entregas encontradas'}
                  </span>

                </div>

              </div>

            )}

            {/* ENTREGA INDIVIDUAL */}

            {tipoPdf === 'individual' && (

              <div className="form-group">

                <label>
                  Escolha a entrega
                </label>

                <div className="input-with-icon">

                  <FileText size={15} />

                  <select
                    value={entregaPdfId}
                    onChange={(event) =>
                      setEntregaPdfId(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Selecione uma entrega
                    </option>

                    {entregas.map(
                      (entrega) => (
                        <option
                          key={entrega.id}
                          value={entrega.id}
                        >
                          {formatarData(
                            entrega.data_entrega
                          )}
                          {' — '}
                          {entrega.cliente?.nome ||
                            'Cliente'}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

            )}

            <div className="pdf-preview-box">

              <Printer size={18} />

              <div>

                <strong>
                  PDF pronto para impressão
                </strong>

                <span>
                  O documento será gerado em formato A4.
                </span>

              </div>

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={fecharModalPdf}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={gerarPdf}
                disabled={gerandoPdf}
              >
                <FileText size={15} />

                {gerandoPdf
                  ? 'Gerando PDF...'
                  : 'Gerar PDF'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default Entregas

