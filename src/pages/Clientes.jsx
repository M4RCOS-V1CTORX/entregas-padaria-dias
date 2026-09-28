
import { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  Phone,
  MapPin,
  Navigation,
  X,
  UserRound
} from 'lucide-react'
import { supabase } from '../services/supabase'

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [formulario, setFormulario] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    bairro: '',
    referencia: ''
  })

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao carregar clientes:', error)
      return
    }

    setClientes(data || [])
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  async function salvarCliente(event) {
    event.preventDefault()

    if (!formulario.nome.trim()) {
      alert('Digite o nome do cliente.')
      return
    }

    if (!formulario.endereco.trim()) {
      alert('Digite o endereço do cliente.')
      return
    }

    setSalvando(true)

    const { error } = await supabase
      .from('clientes')
      .insert([formulario])

    if (error) {
      console.error('Erro ao salvar cliente:', error)
      alert('Não foi possível salvar o cliente.')
      setSalvando(false)
      return
    }

    setFormulario({
      nome: '',
      telefone: '',
      endereco: '',
      bairro: '',
      referencia: ''
    })

    setMostrarFormulario(false)
    setSalvando(false)

    carregarClientes()
  }

  function abrirFormulario() {
    setFormulario({
      nome: '',
      telefone: '',
      endereco: '',
      bairro: '',
      referencia: ''
    })

    setMostrarFormulario(true)
  }

  function fecharFormulario() {
    setMostrarFormulario(false)
  }

  return (
    <div className="page-container">

      {/* CABEÇALHO */}

      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            CADASTROS
          </span>

          <h1>Clientes</h1>

          <p>
            Gerencie os clientes e seus endereços de entrega.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={abrirFormulario}
        >
          <UserPlus size={16} />
          Novo cliente
        </button>

      </div>

      {/* RESUMO */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon green">
            <Users size={19} />
          </div>

          <div>
            <span>Total de clientes</span>
            <strong>{clientes.length}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            <MapPin size={19} />
          </div>

          <div>
            <span>Endereços cadastrados</span>
            <strong>{clientes.length}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon blue">
            <Phone size={19} />
          </div>

          <div>
            <span>Contatos cadastrados</span>
            <strong>
              {
                clientes.filter(
                  (cliente) =>
                    cliente.telefone?.trim()
                ).length
              }
            </strong>
          </div>

        </div>

      </div>

      {/* TÍTULO DA LISTA */}

      <div className="section-header">

        <div>
          <h2>Clientes cadastrados</h2>

          <span>
            Lista de clientes da Padaria Dias.
          </span>
        </div>

      </div>

      {/* LISTA */}

      {clientes.length === 0 ? (

        <div className="empty-state">

          <div className="empty-state-icon">
            <Users size={24} />
          </div>

          <h3>Nenhum cliente cadastrado</h3>

          <p>
            Cadastre o primeiro cliente para começar a organizar suas entregas.
          </p>

          <button
            className="primary-button"
            onClick={abrirFormulario}
          >
            <UserPlus size={16} />
            Cadastrar primeiro cliente
          </button>

        </div>

      ) : (

        <div className="clientes-grid">

          {clientes.map((cliente) => (

            <div
              className="cliente-card"
              key={cliente.id}
            >

              <div className="cliente-card-header">

                <div className="cliente-avatar">
                  {cliente.nome
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div className="cliente-name">

                  <span>CLIENTE</span>

                  <h3>
                    {cliente.nome}
                  </h3>

                </div>

              </div>

              <div className="cliente-info">

                {cliente.telefone && (
                  <div className="cliente-info-row">

                    <div className="cliente-info-icon">
                      <Phone size={14} />
                    </div>

                    <div>
                      <span>Telefone</span>
                      <strong>
                        {cliente.telefone}
                      </strong>
                    </div>

                  </div>
                )}

                <div className="cliente-info-row">

                  <div className="cliente-info-icon">
                    <MapPin size={14} />
                  </div>

                  <div>
                    <span>Endereço</span>
                    <strong>
                      {cliente.endereco}
                    </strong>

                    {cliente.bairro && (
                      <small>
                        {cliente.bairro}
                      </small>
                    )}
                  </div>

                </div>

                {cliente.referencia && (
                  <div className="cliente-reference">

                    <Navigation size={13} />

                    <div>
                      <span>Referência</span>

                      <p>
                        {cliente.referencia}
                      </p>
                    </div>

                  </div>
                )}

              </div>

            </div>

          ))}

        </div>

      )}

      {/* MODAL */}

      {mostrarFormulario && (

        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>

                <span className="page-eyebrow">
                  NOVO CADASTRO
                </span>

                <h2>
                  Novo cliente
                </h2>

                <p>
                  Informe os dados do cliente.
                </p>

              </div>

              <button
                className="close-button"
                onClick={fecharFormulario}
              >
                <X size={18} />
              </button>

            </div>

            <form onSubmit={salvarCliente}>

              <div className="form-group">

                <label>
                  Nome do cliente
                </label>

                <div className="input-with-icon">

                  <UserRound size={15} />

                  <input
                    type="text"
                    name="nome"
                    value={formulario.nome}
                    onChange={alterarCampo}
                    placeholder="Ex.: João da Silva"
                  />

                </div>

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Telefone
                  </label>

                  <div className="input-with-icon">

                    <Phone size={15} />

                    <input
                      type="text"
                      name="telefone"
                      value={formulario.telefone}
                      onChange={alterarCampo}
                      placeholder="(00) 00000-0000"
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Bairro
                  </label>

                  <div className="input-with-icon">

                    <MapPin size={15} />

                    <input
                      type="text"
                      name="bairro"
                      value={formulario.bairro}
                      onChange={alterarCampo}
                      placeholder="Bairro"
                    />

                  </div>

                </div>

              </div>

              <div className="form-group">

                <label>
                  Endereço
                </label>

                <div className="input-with-icon">

                  <MapPin size={15} />

                  <input
                    type="text"
                    name="endereco"
                    value={formulario.endereco}
                    onChange={alterarCampo}
                    placeholder="Rua, número, complemento..."
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Ponto de referência
                </label>

                <div className="input-with-icon textarea-icon">

                  <Navigation size={15} />

                  <textarea
                    name="referencia"
                    value={formulario.referencia}
                    onChange={alterarCampo}
                    placeholder="Ex.: próximo à praça..."
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
                      <UserPlus size={15} />
                      Salvar cliente
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Clientes

