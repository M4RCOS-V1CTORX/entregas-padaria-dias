
import { useEffect, useState } from 'react'
import {
  Package,
  PackagePlus,
  X,
  Tag,
  Wheat,
  CakeSlice,
  Pizza,
  Utensils,
  Boxes
} from 'lucide-react'
import { supabase } from '../services/supabase'

function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [formulario, setFormulario] = useState({
    nome: '',
    categoria: 'Pães'
  })

  const categorias = [
    'Pães',
    'Bolos',
    'Pizzas',
    'Salgados',
    'Outros'
  ]

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao carregar produtos:', error)
      return
    }

    setProdutos(data || [])
  }

  function alterarCampo(event) {
    const { name, value } = event.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  async function salvarProduto(event) {
    event.preventDefault()

    if (!formulario.nome.trim()) {
      alert('Digite o nome do produto.')
      return
    }

    setSalvando(true)

    const { error } = await supabase
      .from('produtos')
      .insert([
        {
          nome: formulario.nome,
          categoria: formulario.categoria
        }
      ])

    if (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Não foi possível salvar o produto.')
      setSalvando(false)
      return
    }

    setFormulario({
      nome: '',
      categoria: 'Pães'
    })

    setMostrarFormulario(false)
    setSalvando(false)

    carregarProdutos()
  }

  function abrirFormulario() {
    setFormulario({
      nome: '',
      categoria: 'Pães'
    })

    setMostrarFormulario(true)
  }

  function fecharFormulario() {
    setMostrarFormulario(false)
  }

  function obterIconeCategoria(categoria) {
    switch (categoria) {
      case 'Pães':
        return Wheat

      case 'Bolos':
        return CakeSlice

      case 'Pizzas':
        return Pizza

      case 'Salgados':
        return Utensils

      default:
        return Boxes
    }
  }

  function obterClasseCategoria(categoria) {
    switch (categoria) {
      case 'Pães':
        return 'category-bread'

      case 'Bolos':
        return 'category-cake'

      case 'Pizzas':
        return 'category-pizza'

      case 'Salgados':
        return 'category-snack'

      default:
        return 'category-other'
    }
  }

  const quantidadePorCategoria = categorias.reduce(
    (resultado, categoria) => {
      resultado[categoria] = produtos.filter(
        (produto) => produto.categoria === categoria
      ).length

      return resultado
    },
    {}
  )

  return (
    <div className="page-container">

      {/* =================================================
          CABEÇALHO
      ================================================= */}

      <div className="page-header">

        <div>

          <span className="page-eyebrow">
            CATÁLOGO
          </span>

          <h1>Produtos</h1>

          <p>
            Organize os produtos e categorias da Padaria Dias.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={abrirFormulario}
        >
          <PackagePlus size={16} />
          Novo produto
        </button>

      </div>

      {/* =================================================
          ESTATÍSTICAS
      ================================================= */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon green">
            <Package size={19} />
          </div>

          <div>
            <span>Total de produtos</span>
            <strong>{produtos.length}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            <Tag size={19} />
          </div>

          <div>
            <span>Categorias</span>
            <strong>{categorias.length}</strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon blue">
            <Boxes size={19} />
          </div>

          <div>
            <span>Itens cadastrados</span>
            <strong>{produtos.length}</strong>
          </div>

        </div>

      </div>

      {/* =================================================
          CATEGORIAS
      ================================================= */}

      <div className="section-header">

        <div>

          <h2>
            Categorias
          </h2>

          <span>
            Visualização rápida do catálogo.
          </span>

        </div>

      </div>

      <div className="categories-grid">

        {categorias.map((categoria) => {

          const Icon = obterIconeCategoria(categoria)

          return (
            <div
              className={`category-card ${
                obterClasseCategoria(categoria)
              }`}
              key={categoria}
            >

              <div className="category-icon">
                <Icon size={19} />
              </div>

              <div className="category-content">

                <strong>
                  {categoria}
                </strong>

                <span>
                  {quantidadePorCategoria[categoria]}
                  {' '}
                  {quantidadePorCategoria[categoria] === 1
                    ? 'produto'
                    : 'produtos'}
                </span>

              </div>

            </div>
          )
        })}

      </div>

      {/* =================================================
          LISTA DE PRODUTOS
      ================================================= */}

      <div
        className="section-header"
        style={{ marginTop: '38px' }}
      >

        <div>

          <h2>
            Produtos cadastrados
          </h2>

          <span>
            Todos os produtos disponíveis para as entregas.
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
            Cadastre os produtos que serão utilizados nas entregas.
          </p>

          <button
            className="primary-button"
            onClick={abrirFormulario}
          >
            <PackagePlus size={16} />
            Cadastrar primeiro produto
          </button>

        </div>

      ) : (

        <div className="produtos-grid">

          {produtos.map((produto) => {

            const Icon =
              obterIconeCategoria(produto.categoria)

            return (
              <div
                className="produto-card"
                key={produto.id}
              >

                <div
                  className={`produto-icon ${
                    obterClasseCategoria(produto.categoria)
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div className="produto-content">

                  <span>
                    {produto.categoria}
                  </span>

                  <h3>
                    {produto.nome}
                  </h3>

                </div>
              </div>
            )
          })}

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
                  Novo produto
                </h2>

                <p>
                  Cadastre um produto da padaria.
                </p>

              </div>

              <button
                className="close-button"
                onClick={fecharFormulario}
              >
                <X size={18} />
              </button>

            </div>

            <form onSubmit={salvarProduto}>

              <div className="form-group">

                <label>
                  Nome do produto
                </label>

                <div className="input-with-icon">

                  <Package size={15} />

                  <input
                    type="text"
                    name="nome"
                    value={formulario.nome}
                    onChange={alterarCampo}
                    placeholder="Ex.: Pão de hambúrguer"
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Categoria
                </label>

                <div className="input-with-icon">

                  <Tag size={15} />

                  <select
                    name="categoria"
                    value={formulario.categoria}
                    onChange={alterarCampo}
                  >

                    {categorias.map((categoria) => (
                      <option
                        key={categoria}
                        value={categoria}
                      >
                        {categoria}
                      </option>
                    ))}

                  </select>

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
                      <PackagePlus size={15} />
                      Salvar produto
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

export default Produtos

