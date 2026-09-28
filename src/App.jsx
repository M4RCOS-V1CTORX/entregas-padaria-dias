
import { useState } from 'react'

import {
  LayoutDashboard,
  PackageCheck,
  Users,
  Package,
  Truck,
  Warehouse,
  Menu,
  X,
  ChevronRight,
  Circle
} from 'lucide-react'

import Clientes from './pages/Clientes'
import Produtos from './pages/Produtos'
import Entregadores from './pages/entregadores'
import Entregas from './pages/Entregas'
import Estoque from './pages/Estoque'

function App() {
  const [pagina, setPagina] = useState('entregas')
  const [menuAberto, setMenuAberto] = useState(false)

  const itensMenu = [
    {
      id: 'entregas',
      nome: 'Entregas',
      descricao: 'Controle de entregas',
      icone: PackageCheck
    },
    {
      id: 'clientes',
      nome: 'Clientes',
      descricao: 'Clientes cadastrados',
      icone: Users
    },
    {
      id: 'produtos',
      nome: 'Produtos',
      descricao: 'Catálogo da padaria',
      icone: Package
    },
    {
      id: 'entregadores',
      nome: 'Entregadores',
      descricao: 'Equipe de entrega',
      icone: Truck
    },
    {
      id: 'estoque',
      nome: 'Produção / Estoque',
      descricao: 'Controle de produção',
      icone: Warehouse
    }
  ]

  const paginaAtual =
    itensMenu.find((item) => item.id === pagina)

  function navegar(id) {
    setPagina(id)
    setMenuAberto(false)
  }

  function renderizarPagina() {
    switch (pagina) {
      case 'clientes':
        return <Clientes />

      case 'produtos':
        return <Produtos />

      case 'entregadores':
        return <Entregadores />

      case 'estoque':
        return <Estoque />

      case 'entregas':
      default:
        return <Entregas />
    }
  }

  return (
    <div className="app-shell">

      {/* =========================================
          SIDEBAR DESKTOP
      ========================================= */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-mark">
            <span className="brand-bread">⌁</span>
          </div>

          <div className="brand-content">
            <strong>Padaria Dias</strong>
            <span>Sistema de Entregas</span>
          </div>

        </div>

        <div className="sidebar-divider"></div>

        <div className="menu-label">
          OPERAÇÃO
        </div>

        <nav className="sidebar-nav">

          {itensMenu.map((item) => {
            const Icon = item.icone
            const ativo = pagina === item.id

            return (
              <button
                key={item.id}
                className={`sidebar-item ${
                  ativo ? 'active' : ''
                }`}
                onClick={() => navegar(item.id)}
              >

                <span className="sidebar-icon">
                  <Icon size={19} strokeWidth={1.9} />
                </span>

                <span className="sidebar-item-content">
                  <strong>{item.nome}</strong>
                  <small>{item.descricao}</small>
                </span>

                {ativo && (
                  <ChevronRight
                    className="sidebar-arrow"
                    size={16}
                  />
                )}

              </button>
            )
          })}

        </nav>

        <div className="sidebar-bottom">

          <div className="system-status">

            <span className="status-indicator">
              <Circle
                size={8}
                fill="currentColor"
              />
            </span>

            <div>
              <strong>Sistema ativo</strong>
              <span>Operação normal</span>
            </div>

          </div>

          <div className="sidebar-footer">
            Padaria Dias · Gestão de entregas
          </div>

        </div>

      </aside>

      {/* =========================================
          ÁREA PRINCIPAL
      ========================================= */}

      <div className="main-area">

        {/* HEADER */}

        <header className="topbar">

          <button
            className="mobile-menu-button"
            onClick={() =>
              setMenuAberto(!menuAberto)
            }
          >
            {menuAberto ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>

          <div className="topbar-left">

            <div className="mobile-brand-mark">
              ⌁
            </div>

            <div className="breadcrumb">

              <span>Padaria Dias</span>

              <ChevronRight
                size={14}
              />

              <strong>
                {paginaAtual?.nome}
              </strong>

            </div>

          </div>

          <div className="topbar-right">

            <div className="online-status">

              <span className="online-dot"></span>

              <span>
                Sistema online
              </span>

            </div>

            <div className="topbar-profile">

              <div className="profile-avatar">
                PD
              </div>

              <div className="profile-info">
                <strong>Padaria Dias</strong>
                <span>Administrador</span>
              </div>

            </div>

          </div>

        </header>

        {/* MENU MOBILE */}

        {menuAberto && (
          <div className="mobile-menu">

            <div className="mobile-menu-header">
              <span>MENU</span>

              <button
                onClick={() =>
                  setMenuAberto(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            {itensMenu.map((item) => {
              const Icon = item.icone
              const ativo = pagina === item.id

              return (
                <button
                  key={item.id}
                  className={`mobile-menu-item ${
                    ativo ? 'active' : ''
                  }`}
                  onClick={() =>
                    navegar(item.id)
                  }
                >

                  <span className="mobile-menu-icon">
                    <Icon size={19} />
                  </span>

                  <span>
                    <strong>{item.nome}</strong>
                    <small>{item.descricao}</small>
                  </span>

                </button>
              )
            })}

          </div>
        )}

        {/* CONTEÚDO */}

        <main className="main-content">
          {renderizarPagina()}
        </main>

      </div>

    </div>
  )
}

export default App

