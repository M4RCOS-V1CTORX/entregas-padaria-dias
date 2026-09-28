
import { useEffect, useState } from 'react'
import {
  Warehouse,
  Package,
  Plus,
  Minus,
  Boxes,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { supabase } from '../services/supabase'

function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [estoque, setEstoque] = useState({})
  const [quantidades, setQuantidades] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [alterando, setAlterando] = useState(null)

  useEffect(() => {
    carregarEstoque()
  }, [])

  async function carregarEstoque() {
    setCarregando(true)

    const { data: produtosData, error: produtosError } =
      await supabase
        .from('produtos')
        .select('*')
        .order('nome')

    if (produtosError) {
      console.error(
        'Erro ao carregar produtos:',
        produtosError
      )

      setCarregando(false)
      return
    }

    const { data: estoqueData, error: estoqueError } =
      await supabase
        .from('estoque')
        .select('*')

    if (estoqueError) {
      console.error(
        'Erro ao carregar estoque:',
        estoqueError
      )

      setCarregando(false)
      return
    }

    const estoqueOrganizado = {}

    ;(estoqueData || []).forEach((item) => {
      estoqueOrganizado[item.produto_id] = item
    })

    setProdutos(produtosData || [])
    setEstoque(estoqueOrganizado)
    setCarregando(false)
  }

  function alterarQuantidade(produtoId, valor) {
    setQuantidades({
      ...quantidades,
      [produtoId]: valor
    })
  }

  async function alterarEstoque(produto, tipo) {
    const valor = Number(quantidades[produto.id])

    if (!valor || valor <= 0) {
      alert('Digite uma quantidade válida.')
      return
    }

    const estoqueAtual =
      Number(estoque[produto.id]?.quantidade || 0)

    let novaQuantidade = estoqueAtual

    if (tipo === 'adicionar') {
      novaQuantidade = estoqueAtual + valor
    }

    if (tipo === 'retirar') {
      novaQuantidade = estoqueAtual - valor

      if (novaQuantidade < 0) {
        alert(
          'Não há quantidade suficiente em estoque.'
        )
        return
      }
    }

    setAlterando(`${produto.id}-${tipo}`)

    const registroExistente =
      estoque[produto.id]

    if (registroExistente) {
      const { error } = await supabase
        .from('estoque')
        .update({
          quantidade: novaQuantidade,
          updated_at: new Date().toISOString()
        })
        .eq('id', registroExistente.id)

      if (error) {
        console.error(
          'Erro ao atualizar estoque:',
          error
        )

        alert(
          'Não foi possível atualizar o estoque.'
        )

        setAlterando(null)
        return
      }
    } else {
      const { error } = await supabase
        .from('estoque')
        .insert([
          {
            produto_id: produto.id,
            quantidade: novaQuantidade
          }
        ])

      if (error) {
        console.error(
          'Erro ao criar estoque:',
          error
        )

        alert(
          'Não foi possível criar o estoque.'
        )

        setAlterando(null)
        return
      }
    }

    setQuantidades({
      ...quantidades,
      [produto.id]: ''
    })

    setAlterando(null)

    carregarEstoque()
  }

  function obterNivelEstoque(quantidade) {
    const valor = Number(quantidade)

    if (valor === 0) {
      return 'empty'
    }

    if (valor <= 10) {
      return 'low'
    }

    return 'normal'
  }

  function obterTextoEstoque(quantidade) {
    const valor = Number(quantidade)

    if (valor === 0) {
      return 'Sem estoque'
    }

    if (valor <= 10) {
      return 'Estoque baixo'
    }

    return 'Estoque disponível'
  }

  const totalProdutos = produtos.length

  const produtosComEstoque = produtos.filter(
    (produto) =>
      Number(
        estoque[produto.id]?.quantidade || 0
      ) > 0
  ).length

  const estoqueBaixo = produtos.filter(
    (produto) => {
      const quantidade = Number(
        estoque[produto.id]?.quantidade || 0
      )

      return quantidade > 0 && quantidade <= 10
    }
  ).length

  const semEstoque = produtos.filter(
    (produto) =>
      Number(
        estoque[produto.id]?.quantidade || 0
      ) === 0
  ).length

  if (carregando) {
    return (
      <div className="page-container">

        <div className="page-header">

          <div>
            <span className="page-eyebrow">
              OPERAÇÃO
            </span>

            <h1>
              Produção / Estoque
            </h1>

            <p>
              Carregando informações do estoque...
            </p>
          </div>

        </div>

        <div className="stock-loading">
          <div className="stock-loading-icon">
            <Warehouse size={24} />
          </div>

          <span>
            Carregando estoque...
          </span>
        </div>

      </div>
    )
  }

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
            Produção / Estoque
          </h1>

          <p>
            Controle simples da quantidade disponível
            de cada produto.
          </p>

        </div>

        <div className="stock-header-badge">
          <Warehouse size={16} />
          Controle de estoque
        </div>

      </div>

      {/* =================================================
          ESTATÍSTICAS
      ================================================= */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon green">
            <Boxes size={19} />
          </div>

          <div>
            <span>Total de produtos</span>
            <strong>
              {totalProdutos}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon blue">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Com estoque</span>
            <strong>
              {produtosComEstoque}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            <AlertTriangle size={19} />
          </div>

          <div>
            <span>Estoque baixo</span>
            <strong>
              {estoqueBaixo}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          RESUMO
      ================================================= */}

      <div className="stock-summary">

        <div className="stock-summary-title">

          <div className="stock-summary-icon">
            <Warehouse size={17} />
          </div>

          <div>
            <strong>
              Visão geral
            </strong>

            <span>
              Situação atual dos produtos
            </span>
          </div>

        </div>

        <div className="stock-summary-items">

          <div>
            <span className="summary-dot normal"></span>
            <strong>
              {produtosComEstoque}
            </strong>
            <small>
              disponíveis
            </small>
          </div>

          <div>
            <span className="summary-dot low"></span>
            <strong>
              {estoqueBaixo}
            </strong>
            <small>
              estoque baixo
            </small>
          </div>

          <div>
            <span className="summary-dot empty"></span>
            <strong>
              {semEstoque}
            </strong>
            <small>
              sem estoque
            </small>
          </div>

        </div>

      </div>

      {/* =================================================
          LISTA
      ================================================= */}

      <div className="section-header">

        <div>

          <h2>
            Controle de produtos
          </h2>

          <span>
            Produza ou retire quantidades do estoque.
          </span>

        </div>

      </div>

      {produtos.length === 0 ? (

        <div className="empty-state">

          <div className="empty-state-icon">
            <Package size={24} />
          </div>

          <h3>
            Nenhum produto cadastrado
          </h3>

          <p>
            Cadastre produtos primeiro para começar
            a controlar o estoque.
          </p>

        </div>

      ) : (

        <div className="estoque-grid">

          {produtos.map((produto) => {

            const quantidadeAtual = Number(
              estoque[produto.id]?.quantidade || 0
            )

            const nivel =
              obterNivelEstoque(
                quantidadeAtual
              )

            const texto =
              obterTextoEstoque(
                quantidadeAtual
              )

            const carregandoAdicionar =
              alterando ===
              `${produto.id}-adicionar`

            const carregandoRetirar =
              alterando ===
              `${produto.id}-retirar`

            return (
              <div
                className="estoque-card"
                key={produto.id}
              >

                {/* CABEÇALHO DO CARD */}

                <div className="estoque-card-header">

                  <div className="estoque-product-icon">
                    <Package size={19} />
                  </div>

                  <div className="estoque-product-info">

                    <span>
                      {produto.categoria}
                    </span>

                    <h3>
                      {produto.nome}
                    </h3>

                  </div>

                </div>

                {/* QUANTIDADE */}

                <div
                  className={`estoque-quantity ${nivel}`}
                >

                  <div>
                    <span>
                      DISPONÍVEL
                    </span>

                    <strong>
                      {quantidadeAtual}
                    </strong>
                  </div>

                  <div className="estoque-status">

                    {nivel === 'empty' && (
                      <AlertTriangle size={13} />
                    )}

                    {nivel === 'low' && (
                      <AlertTriangle size={13} />
                    )}

                    {nivel === 'normal' && (
                      <TrendingUp size={13} />
                    )}

                    {texto}

                  </div>

                </div>

                {/* CONTROLE */}

                <div className="estoque-control">

                  <label>
                    Quantidade
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Digite a quantidade"
                    value={
                      quantidades[produto.id] || ''
                    }
                    onChange={(event) =>
                      alterarQuantidade(
                        produto.id,
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* BOTÕES */}

                <div className="estoque-actions">

                  <button
                    className="stock-add-button"
                    onClick={() =>
                      alterarEstoque(
                        produto,
                        'adicionar'
                      )
                    }
                    disabled={
                      carregandoAdicionar ||
                      carregandoRetirar
                    }
                  >
                    <Plus size={15} />

                    {carregandoAdicionar
                      ? 'Produzindo...'
                      : 'Produzir'}
                  </button>

                  <button
                    className="stock-remove-button"
                    onClick={() =>
                      alterarEstoque(
                        produto,
                        'retirar'
                      )
                    }
                    disabled={
                      carregandoAdicionar ||
                      carregandoRetirar
                    }
                  >
                    <Minus size={15} />

                    {carregandoRetirar
                      ? 'Retirando...'
                      : 'Retirar'}
                  </button>

                </div>

              </div>
            )
          })}

        </div>

      )}

    </div>
  )
}

export default Estoque