
import { useEffect, useState } from 'react'
import {
  Truck,
  UserPlus,
  Phone,
  X,
  UserRound,
  Users,
  CircleCheck,
  Bike
} from 'lucide-react'
import { supabase } from '../services/supabase'

function Entregadores() {
  const [entregadores, setEntregadores] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [formulario, setFormulario] = useState({
    nome: '',
    telefone: ''
  })

  useEffect(() => {
    carregarEntregadores()
  }, [])

  async function carregarEntregadores() {
    const { data, error } = await supabase
      .from('entregadores')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao carregar entregadores:', error)
      return
    }

    setEntregadores(data || [])
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  async function salvarEntregador(event) {
    event.preventDefault()

    if (!formulario.nome.trim()) {
      alert('Digite o nome do entregador.')
      return
    }

    if (!formulario.telefone.trim()) {
      alert('Digite o telefone do entregador.')
      return
    }

    setSalvando(true)

    const { error } = await supabase
      .from('entregadores')
      .insert([
        {
          nome: formulario.nome.trim(),
          telefone: formulario.telefone.trim()
        }
      ])

    if (error) {
      console.error('Erro ao salvar entregador:', error)
      alert('Não foi possível salvar o entregador.')
      setSalvando(false)
      return
    }

    setFormulario({
      nome: '',
      telefone: ''
    })

    setMostrarFormulario(false)
    setSalvando(false)

    carregarEntregadores()
  }

  function abrirFormulario() {
    setFormulario({
      nome: '',
      telefone: ''
    })

    setMostrarFormulario(true)
  }

  function fecharFormulario() {
    setMostrarFormulario(false)
  }

  return (
    <div className="page-container">

      {/* =================================================
          CABEÇALHO
      ================================================= */}

      <div className="page-header">

        <div>

          <span className="page-eyebrow">
            EQUIPE
          </span>

          <h1>Entregadores</h1>

          <p>
            Gerencie a equipe responsável pelas entregas.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={abrirFormulario}
        >
          <UserPlus size={16} />
          Novo entregador
        </button>

      </div>

      {/* =================================================
          ESTATÍSTICAS
      ================================================= */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon green">
            <Users size={19} />
          </div>

          <div>
            <span>Total de entregadores</span>
            <strong>{entregadores.length}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon blue">
            <CircleCheck size={19} />
          </div>

          <div>
            <span>Entregadores ativos</span>
            <strong>
              {
                entregadores.filter(
                  (entregador) =>
                    entregador.ativo !== false
                ).length
              }
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            <Phone size={19} />
          </div>

          <div>
            <span>Contatos cadastrados</span>
            <strong>
              {
                entregadores.filter(
                  (entregador) =>
                    entregador.telefone?.trim()
                ).length
              }
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
            Equipe de entrega
          </h2>

          <span>
            Entregadores cadastrados na Padaria Dias.
          </span>

        </div>

      </div>

      {entregadores.length === 0 ? (

        <div className="empty-state">

          <div className="empty-state-icon">
            <Truck size={24} />
          </div>

          <h3>
            Nenhum entregador cadastrado
          </h3>

          <p>
            Cadastre os entregadores que irão realizar as entregas.
          </p>

          <button
            className="primary-button"
            onClick={abrirFormulario}
          >
            <UserPlus size={16} />
            Cadastrar primeiro entregador
          </button>

        </div>

      ) : (

        <div className="entregadores-grid">

          {entregadores.map((entregador) => (

            <div
              className="entregador-card"
              key={entregador.id}
            >

              <div className="entregador-card-top">

                <div className="entregador-avatar">
                  {entregador.nome
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div className="entregador-name">

                  <span>
                    ENTREGADOR
                  </span>

                  <h3>
                    {entregador.nome}
                  </h3>

                </div>

                <div className="entregador-status">
                  <span></span>
                  Ativo
                </div>

              </div>

              <div className="entregador-divider"></div>

              <div className="entregador-info">

                <div className="entregador-info-icon">
                  <Phone size={14} />
                </div>

                <div>
                  <span>
                    Telefone
                  </span>

                  <strong>
                    {entregador.telefone}
                  </strong>
                </div>

              </div>

              <div className="entregador-footer">

                <div>
                  <Bike size={14} />
                  <span>
                    Disponível para entregas
                  </span>
                </div>

                <Truck size={15} />

              </div>

            </div>

          ))}

        </div>

      )}

      {/* =================================================
          MODAL
      ================================================= */}

      {mostrarFormulario && (

        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>

                <span className="page-eyebrow">
                  NOVO CADASTRO
                </span>

                <h2>
                  Novo entregador
                </h2>

                <p>
                  Informe os dados do entregador.
                </p>

              </div>

              <button
                className="close-button"
                onClick={fecharFormulario}
              >
                <X size={18} />
              </button>

            </div>

            <form onSubmit={salvarEntregador}>

              <div className="form-group">

                <label>
                  Nome do entregador
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

              <div className="entregador-modal-note">

                <div>
                  <Truck size={15} />
                </div>

                <span>
                  Este entregador ficará disponível
                  para ser selecionado nas entregas.
                </span>

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
                      Salvar entregador
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

export default Entregadores
