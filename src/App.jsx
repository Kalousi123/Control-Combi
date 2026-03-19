import { useState, useEffect } from 'react'
import { LayoutDashboard, Map, Receipt, Bus, Wrench, FileText, AlertTriangle, CheckCircle, Wallet, Calendar, TrendingUp, History, Users, Fuel, Coffee, Divide } from 'lucide-react'

// Hook para Local Storage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // App State V2
  const [currentTrips, setCurrentTrips] = useLocalStorage('combi_current_trips', [])
  const [dailyHistory, setDailyHistory] = useLocalStorage('combi_daily_history', [])
  const [expenses, setExpenses] = useLocalStorage('combi_expenses', [])
  const [dates, setDates] = useLocalStorage('combi_dates', {
    maintenance: '2026-04-15',
    soat: '2026-11-12'
  })

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-surface sticky top-0 z-10 glass-panel border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Control Combi
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Chupaca - Huancayo</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'dashboard' && <Dashboard 
          currentTrips={currentTrips} 
          setCurrentTrips={setCurrentTrips}
          dailyHistory={dailyHistory} 
          setDailyHistory={setDailyHistory}
          dates={dates} 
          setActiveTab={setActiveTab}
        />}
        {activeTab === 'trips' && <TripForm currentTrips={currentTrips} setCurrentTrips={setCurrentTrips} setActiveTab={setActiveTab} />}
        {activeTab === 'history' && <HistoryTab dailyHistory={dailyHistory} />}
        {activeTab === 'expenses' && <ExpenseForm expenses={expenses} setExpenses={setExpenses} dates={dates} setDates={setDates} setActiveTab={setActiveTab} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface/90 backdrop-blur-xl border-t border-white/10 flex justify-around p-2 pb-safe z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1.5 p-2 px-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Hoy</span>
        </button>
        <button 
          onClick={() => setActiveTab('trips')}
          className={`flex flex-col items-center gap-1.5 p-2 px-3 rounded-xl transition-all ${activeTab === 'trips' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Vueltas</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1.5 p-2 px-3 rounded-xl transition-all ${activeTab === 'history' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Historial</span>
        </button>
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center gap-1.5 p-2 px-3 rounded-xl transition-all ${activeTab === 'expenses' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Costos</span>
        </button>
      </nav>
    </div>
  )
}

function Dashboard({ currentTrips, setCurrentTrips, dailyHistory, setDailyHistory, dates, setActiveTab }) {
  const [showCloseDayModal, setShowCloseDayModal] = useState(false)
  
  // Datos del Día Actual en Curso
  const totalIngresosHoy = currentTrips.reduce((sum, trip) => sum + Number(trip.ingresos), 0)
  const totalYapeHoy = currentTrips.reduce((sum, trip) => sum + Number(trip.yape || 0), 0)
  const totalGastosVueltasHoy = currentTrips.reduce((sum, trip) => sum + Number(trip.gastoMonto || 0), 0)
  const vueltasDadas = currentTrips.length

  // Histórico
  const diasTrabajados = dailyHistory.length
  const gananciaNetaTotal = dailyHistory.reduce((sum, day) => sum + Number(day.gananciaCarro), 0)

  // Funciones de fecha para alertas
  const getDaysDiff = (dateStr) => {
    const target = new Date(dateStr)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const maintDays = getDaysDiff(dates.maintenance)
  const soatDays = getDaysDiff(dates.soat)
  const formatCurrency = (val) => `S/ ${Number(val).toFixed(2)}`

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Resumen del Día Actual */}
      <div className="glass-panel p-6 rounded-[2rem] border border-blue-500/30 bg-blue-900/10 relative overflow-hidden shadow-xl shadow-blue-500/5">
         <div className="absolute -top-10 -right-10 text-blue-500/10">
           <Bus className="w-40 h-40" />
         </div>
         <h2 className="text-lg font-bold text-blue-200 mb-4 flex items-center gap-2 relative z-10">
           <Calendar className="w-5 h-5" /> Resumen de Hoy
         </h2>
         
         <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
            <div>
               <div className="text-xs text-blue-300/70 font-bold uppercase tracking-wider mb-1">Recaudado (Pasajes)</div>
               <div className="text-3xl font-black text-white">{formatCurrency(totalIngresosHoy)}</div>
            </div>
            <div>
               <div className="text-xs text-blue-300/70 font-bold uppercase tracking-wider mb-1">Vueltas Dadas</div>
               <div className="text-3xl font-black text-white">{vueltasDadas}</div>
            </div>
            {totalGastosVueltasHoy > 0 && (
               <div className="col-span-2 mt-[-10px]">
                  <div className="text-[10px] text-orange-300 font-bold uppercase">Gastos Menores en Vueltas: <span className="text-white">S/ {totalGastosVueltasHoy.toFixed(2)}</span></div>
               </div>
            )}
         </div>

         {vueltasDadas > 0 ? (
           <button 
             onClick={() => setShowCloseDayModal(true)}
             className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 relative z-10 transition-all active:scale-[0.98]">
             <CheckCircle className="w-5 h-5" /> Realizar Liquidación del Día
           </button>
         ) : (
           <button 
             onClick={() => setActiveTab('trips')}
             className="w-full bg-blue-500/20 text-blue-300 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 relative z-10 border border-blue-500/30">
             <Map className="w-5 h-5" /> Empezar a registrar vueltas
           </button>
         )}
      </div>

      {/* Histórico Global Simplificado */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-3xl flex flex-col relative overflow-hidden group border border-white/5">
          <div className="bg-slate-700/50 w-8 h-8 rounded-xl flex items-center justify-center mb-2">
             <Calendar className="w-4 h-4 text-slate-300" />
          </div>
          <span className="text-[10px] text-slate-400 z-10 font-bold uppercase tracking-wider">Días Trabajados</span>
          <span className="text-xl font-black text-white z-10">{diasTrabajados} días</span>
        </div>

        <div className="glass-panel p-4 rounded-3xl flex flex-col relative overflow-hidden group border border-emerald-500/20 shadow-lg shadow-emerald-500/5 bg-emerald-900/10">
          <div className="bg-emerald-500/20 w-8 h-8 rounded-xl flex items-center justify-center mb-2">
             <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-400/70 z-10 font-bold uppercase tracking-wider">Ganancia Histórica Neta</span>
          <span className="text-xl font-black text-emerald-400 z-10">{formatCurrency(gananciaNetaTotal)}</span>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/5 bg-slate-800/40">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
           <AlertTriangle className="w-4 h-4 text-orange-400" /> Alertas de Vehículo
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-800/80 border border-white/5">
            <div className="flex items-center gap-3">
               <div className="bg-orange-500/20 p-2 rounded-xl">
                 <Wrench className="w-4 h-4 text-orange-400" />
               </div>
               <div>
                  <div className="text-[13px] font-bold text-slate-200">Mantenimiento</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{new Date(dates.maintenance).toLocaleDateString()}</div>
               </div>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${maintDays <= 7 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/10 text-orange-400'}`}>
              <AlertTriangle className="w-3 h-3" /> {maintDays} d
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-800/80 border border-white/5">
            <div className="flex items-center gap-3">
               <div className="bg-emerald-500/20 p-2 rounded-xl">
                 <FileText className="w-4 h-4 text-emerald-400" />
               </div>
               <div>
                  <div className="text-[13px] font-bold text-slate-200">SOAT</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{new Date(dates.soat).toLocaleDateString()}</div>
               </div>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${soatDays <= 15 ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <CheckCircle className="w-3 h-3" /> {soatDays} d
            </span>
          </div>
        </div>
      </div>

      {showCloseDayModal && (
        <CloseDayModal 
          totalIngresosHoy={totalIngresosHoy} 
          totalYapeHoy={totalYapeHoy}
          totalGastosVueltasHoy={totalGastosVueltasHoy}
          currentTrips={currentTrips}
          onClose={() => setShowCloseDayModal(false)}
          onConfirm={(dailyRecord) => {
            setDailyHistory([...dailyHistory, dailyRecord])
            setCurrentTrips([]) // Resetea las vueltas después de liquidar
            setShowCloseDayModal(false)
            setActiveTab('history') // Redirige al historial para ver la liquidación guardada
          }}
        />
      )}
    </div>
  )
}

function CloseDayModal({ totalIngresosHoy, totalYapeHoy, totalGastosVueltasHoy, currentTrips, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    gasolina: '',
    almuerzo: '',
    tributo: '',
    chofer: '',
    cobrador: ''
  })
  
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [trabajoSolo, setTrabajoSolo] = useState(false)

  const handleChange = (e) => {
    const val = e.target.value
    const name = e.target.name
    setFormData(prev => ({...prev, [name]: val}))
  }

  // Lógica de cálculo 
  const numIngresos = Number(totalIngresosHoy || 0)
  const numGasolina = Number(formData.gasolina || 0)
  const numAlmuerzo = Number(formData.almuerzo || 0)
  const numTributo = Number(formData.tributo || 0)
  const numGastosVuelta = Number(totalGastosVueltasHoy || 0)

  // Monto Libre a Repartir
  const montoLibre = numIngresos - numGasolina - numAlmuerzo - numTributo - numGastosVuelta

  // Efecto para auto calcular porcentajes cuando cambian gastos operativos y está activo el auto:
  useEffect(() => {
    if(autoCalculate && montoLibre > 0) {
      if(trabajoSolo) {
        setFormData(prev => ({
          ...prev,
          chofer: (montoLibre * 0.50).toFixed(2), // 50% Sueldo Dueño
          cobrador: '0' // Sin cobrador
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          chofer: (montoLibre * 0.30).toFixed(2), // 30%
          cobrador: (montoLibre * 0.20).toFixed(2) // 20%
        }))
      }
    } else if (autoCalculate && montoLibre <= 0) {
      setFormData(prev => ({ ...prev, chofer: '', cobrador: '' }))
    }
  }, [numIngresos, numGasolina, numAlmuerzo, numTributo, autoCalculate, montoLibre, trabajoSolo])

  // Desactivar autocalculate si el usuario edita chofer/cobrador
  const handleManualEdit = (e) => {
    setAutoCalculate(false)
    handleChange(e)
  }

  // Toggle de modo Trabajo Solo
  const handleToggleSolo = (e) => {
    setTrabajoSolo(e.target.checked)
    setAutoCalculate(true) // Forzar recalculo
  }

  const numChofer = Number(formData.chofer || 0)
  const numCobrador = Number(formData.cobrador || 0)
  const gananciaCarroNeta = montoLibre - numChofer - numCobrador

  const handleSave = () => {
    if(gananciaCarroNeta < 0 && !window.confirm("La ganancia del carro es negativa. ¿Estás seguro de registrar el día con pérdida?")) {
      return
    }
    
    onConfirm({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      vueltasMontoTot: totalIngresosHoy,
      totalYape: totalYapeHoy,
      gastosMenores: totalGastosVueltasHoy,
      vueltasCount: currentTrips.length,
      vueltas: currentTrips, // Se guarda la lista completa para V5
      gasolina: numGasolina,
      almuerzo: numAlmuerzo,
      tributo: numTributo,
      chofer: numChofer,
      cobrador: numCobrador,
      montoLibre: montoLibre,
      gananciaCarro: gananciaCarroNeta
    })
  }

  // Verificar Efectivo Real para el cobro
  // El efectivo que debe darte el cobrador es tu parte (Ganancia Carro) MENOS lo que ya está en tu Yape
  // (Si el Yape es mayor a tu ganancia, significa que DEBES plata o le pagas a tu personal desde Yape)
  // Nota: Además, el cobrador uso efectivo de la caja para gastos de vueltas menores (GastosVuelta). 
  // No necesitamos restarlos del efectivo esperado porque el cobrador ya los descontó de la caja común en la calle.
  // Tu ganancia asume que los gastos de vuelta salieron del total de billetes.
  const efectivoRealParaDueño = gananciaCarroNeta - totalYapeHoy;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col justify-end">
      <div className="bg-surface glass-panel rounded-t-[2rem] border-t border-white/10 p-6 space-y-5 animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] overflow-y-auto w-full max-w-md mx-auto relative">
        <div className="flex justify-between items-center mb-2 sticky top-0 bg-surface/90 pt-1 pb-3 backdrop-blur-md z-10 border-b border-white/10">
           <h2 className="text-xl font-bold text-white">Liquidación del Día</h2>
           <button onClick={onClose} className="text-slate-400 p-2 bg-slate-800/50 rounded-full hover:bg-slate-700 transition">✕</button>
        </div>

        {/* Resumen Ingresos */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-4 rounded-2xl flex justify-between items-center shadow-inner">
           <div>
             <div className="text-[10px] text-blue-300/80 font-bold uppercase tracking-wider mb-0.5">Recaudación Total ({currentTrips.length} Vueltas)</div>
             <div className="text-2xl font-black text-blue-400">S/ {totalIngresosHoy.toFixed(2)}</div>
             {totalYapeHoy > 0 && <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mt-1">(Incluye S/ {totalYapeHoy.toFixed(2)} Yape)</div>}
           </div>
        </div>

        {/* Gastos Operativos Diarios */}
        <div>
          <h3 className="text-xs text-orange-300 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" /> Gastos Operativos</h3>
          
          {totalGastosVueltasHoy > 0 && (
             <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex justify-between items-center text-red-200">
                <span className="text-[11px] font-bold uppercase">Agua/Comida Gastado en Vueltas</span>
                <span className="text-sm font-black">- S/ {totalGastosVueltasHoy.toFixed(2)}</span>
             </div>
          )}

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
               <label className="text-[11px] text-slate-400 font-medium">Gasolina / Combustible</label>
               <input name="gasolina" type="number" value={formData.gasolina} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-3 text-white focus:border-orange-500 transition-all text-sm font-medium hover:border-white/20" placeholder="0.00" />
             </div>
             <div className="space-y-1">
               <label className="text-[11px] text-slate-400 font-medium">Tributo / Peajes</label>
               <input name="tributo" type="number" value={formData.tributo} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-3 text-white focus:border-orange-500 transition-all text-sm font-medium hover:border-white/20" placeholder="0.00" />
             </div>
             <div className="space-y-1 col-span-2">
               <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5" /> Almuerzo Chofer/Cobrador</label>
               <input name="almuerzo" type="number" value={formData.almuerzo} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-3 text-white focus:border-orange-500 transition-all text-sm font-medium hover:border-white/20" placeholder="0.00" />
             </div>
          </div>
        </div>
        
        <div className="h-px bg-white/10 w-full"></div>

        {/* Repartición */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Repartición</h3>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Monto a Repartir</span>
              <span className={`text-sm font-bold ${montoLibre > 0 ? 'text-white' : 'text-red-400'}`}>S/ {montoLibre.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 mb-2">
            <span className="text-[11px] text-blue-300 font-bold uppercase flex items-center gap-2">Trabajé Solo (Sin Chofer ni Cobrador)</span>
            <input type="checkbox" checked={trabajoSolo} onChange={handleToggleSolo} className="w-4 h-4 rounded text-blue-500 accent-blue-500" />
          </div>

          <div className="flex items-center justify-between bg-slate-800/50 p-2.5 rounded-xl border border-white/5 mb-3">
            <span className="text-[11px] text-slate-300 font-bold uppercase flex items-center gap-2"><Divide className="w-3.5 h-3.5"/> {trabajoSolo ? 'Forzar 50/50' : 'Forzar 50/30/20'}</span>
            <input type="checkbox" checked={autoCalculate} onChange={(e) => setAutoCalculate(e.target.checked)} className="w-4 h-4 rounded text-blue-500 accent-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className={`space-y-1 relative ${trabajoSolo ? 'col-span-2' : ''}`}>
               <label className="text-[11px] text-slate-400 font-medium">{trabajoSolo ? `Tu Sueldo (Dueño) ${autoCalculate ? '(50%)' : ''}` : `Pago Chofer ${autoCalculate ? '(30%)' : ''}`}</label>
               <input name="chofer" type="number" value={formData.chofer} onChange={handleManualEdit} className={`w-full bg-slate-900/50 border rounded-xl px-3 py-3 text-white text-sm font-medium transition-all focus:bg-slate-900 ${autoCalculate ? 'border-emerald-500/30 focus:border-emerald-500' : 'border-white/10 focus:border-blue-500'}`} placeholder="0.00" />
             </div>
             {!trabajoSolo && (
               <div className="space-y-1 relative">
                 <label className="text-[11px] text-slate-400 font-medium">Pago Cobrador {autoCalculate && '(20%)'}</label>
                 <input name="cobrador" type="number" value={formData.cobrador} onChange={handleManualEdit} className={`w-full bg-slate-900/50 border rounded-xl px-3 py-3 text-white text-sm font-medium transition-all focus:bg-slate-900 ${autoCalculate ? 'border-emerald-500/30 focus:border-emerald-500' : 'border-white/10 focus:border-blue-500'}`} placeholder="0.00" />
               </div>
             )}
          </div>
        </div>

        {/* Cierre: Yape y Efectivo Dueño */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 mt-2 space-y-3 shadow-inner">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <div className="text-sm font-bold text-white">Ganancia Dueño (Carro)</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{autoCalculate ? 'Sobrante (50%)' : 'Monto Sobrante'}</div>
              </div>
              <span className={`text-xl font-black ${gananciaCarroNeta >= 0 ? 'text-white' : 'text-red-400'}`}>
                S/ {gananciaCarroNeta.toFixed(2)}
              </span>
            </div>

            {totalYapeHoy > 0 && (
              <div className="flex justify-between items-center bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
                <div className="text-[11px] text-purple-300 font-bold uppercase">Ya en tu Yape</div>
                <span className="text-sm font-bold text-purple-400">S/ {totalYapeHoy.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-1">
              <div className="text-[13px] font-bold text-emerald-400 uppercase tracking-wide">Efectivo en mano (Caja)</div>
              {efectivoRealParaDueño >= 0 ? (
                <span className="text-2xl font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl">
                  S/ {efectivoRealParaDueño.toFixed(2)}
                </span>
              ) : (
                <div className="text-right">
                  <span className="text-lg font-black text-red-400 block border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded-lg">Falta S/ {Math.abs(efectivoRealParaDueño).toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400">(Abonaste de más por Yape)</span>
                </div>
              )}
            </div>
            {efectivoRealParaDueño >= 0 && <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest pt-2">Esto es lo que debe entregarte el cobrador hoy</p>}
        </div>

        <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mt-4 active:scale-[0.98]">
          <CheckCircle className="w-5 h-5" /> Confirmar y Guardar Liquidación
        </button>

      </div>
    </div>
  )
}

function TripForm({ currentTrips, setCurrentTrips, setActiveTab }) {
  const [efectivo, setEfectivo] = useState('')
  const [yape, setYape] = useState('')
  const [gastosExtras, setGastosExtras] = useState([{ monto: '', detalle: '' }])

  const addGastoExtra = (e) => {
    e.preventDefault()
    setGastosExtras([...gastosExtras, { monto: '', detalle: '' }])
  }

  const removeGastoExtra = (index) => {
    setGastosExtras(gastosExtras.filter((_, i) => i !== index))
  }

  const handleGastoChange = (index, field, value) => {
    const newGastos = [...gastosExtras]
    newGastos[index][field] = value
    setGastosExtras(newGastos)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(!efectivo && !yape) return alert("Ingresa algún monto en efectivo o en yape")
    
    const numEfectivo = Number(efectivo) || 0
    const numYape = Number(yape) || 0
    const totalRecaudado = numEfectivo + numYape
    
    const validGastos = gastosExtras.filter(g => Number(g.monto) > 0)
    const totalGastosExtras = validGastos.reduce((sum, g) => sum + Number(g.monto), 0)
    const detalleGastosExtras = validGastos.map(g => g.detalle || 'Gasto').join(' + ')

    const newTrip = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      ingresos: totalRecaudado, // Se mantiene 'ingresos' como total para compatibilidad
      efectivo: numEfectivo,
      yape: numYape,
      gastoMonto: totalGastosExtras,
      gastoDetalle: detalleGastosExtras
    }
    setCurrentTrips([...currentTrips, newTrip])
    setEfectivo('')
    setYape('')
    setGastosExtras([{ monto: '', detalle: '' }])
  }

  const deleteTrip = (id) => {
    setCurrentTrips(currentTrips.filter(t => t.id !== id))
  }

  const totalPreview = (Number(efectivo) || 0) + (Number(yape) || 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold text-white mb-2">Registro de Vueltas (Hoy)</h2>
      
      <div className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-slate-800/40">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs text-emerald-400 ml-1 font-bold uppercase tracking-wider">Monto en Efectivo</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">S/</span>
                <input type="number" value={efectivo} onChange={(e)=>setEfectivo(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-white text-lg font-bold outline-none focus:border-emerald-500 focus:bg-slate-900 transition-all group-hover:border-emerald-500/30" placeholder="0.00" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs text-purple-400 ml-1 font-bold uppercase tracking-wider">Monto en Yape</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">S/</span>
                <input type="number" value={yape} onChange={(e)=>setYape(e.target.value)} className="w-full bg-purple-900/10 border border-purple-500/20 rounded-2xl pl-10 pr-4 py-4 text-purple-100 text-lg font-bold outline-none focus:border-purple-500 focus:bg-purple-900/20 transition-all group-hover:border-purple-500/30" placeholder="0.00" />
              </div>
            </div>
          </div>
          
          <div className="border border-red-500/20 rounded-2xl p-4 bg-red-900/10 space-y-3 shadow-inner relative">
             <div className="flex justify-between items-center">
               <label className="text-xs text-red-400 font-bold uppercase tracking-wider block">Gastos Menores en esta vuelta</label>
               <button type="button" onClick={addGastoExtra} className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full font-bold hover:bg-red-500/30 transition-all active:scale-95">
                 + Añadir otro
               </button>
             </div>
             
             {gastosExtras.map((gasto, idx) => (
               <div key={idx} className="flex gap-2 items-center animate-in fade-in slide-in-from-top-2 duration-300">
                 <div className="w-1/3 relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/50 font-medium text-sm">S/</span>
                   <input type="number" value={gasto.monto} onChange={(e)=>handleGastoChange(idx, 'monto', e.target.value)} className="w-full bg-slate-900/50 border border-red-500/20 rounded-xl pl-8 pr-2 py-3 text-red-200 text-sm font-bold outline-none focus:border-red-500 transition-all" placeholder="0.00" />
                 </div>
                 <div className="flex-1 relative">
                   <input type="text" value={gasto.detalle} onChange={(e)=>handleGastoChange(idx, 'detalle', e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-red-500 transition-all pr-8" placeholder="Ej: Agua y galleta" />
                   {gastosExtras.length > 1 && (
                     <button type="button" onClick={() => removeGastoExtra(idx)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 p-1">✕</button>
                   )}
                 </div>
               </div>
             ))}
          </div>
          
          <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-2xl border border-white/5">
             <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Bruto de Vuelta</div>
             <div className="text-lg font-black text-blue-400">S/ {totalPreview.toFixed(2)}</div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 text-white font-bold tracking-wide transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-2">
            <CheckCircle className="w-5 h-5" /> Registrar Vuelta
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2 flex justify-between items-center">
          Vueltas registradas hoy <span className="text-white bg-slate-800 px-2 py-0.5 rounded-full">{currentTrips.length}</span>
        </h3>
        
        {currentTrips.length === 0 ? (
          <div className="text-center py-10 bg-slate-800/20 border border-dashed border-white/10 rounded-3xl">
            <Map className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Aún no hay vueltas hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
             {currentTrips.slice().reverse().map((trip, idx) => (
               <div key={trip.id} className="flex flex-col p-3 rounded-2xl bg-slate-800/60 border border-white/5 relative overflow-hidden">
                 {Number(trip.yape) > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>}
                 
                 <div className="flex justify-between items-center pl-1">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                       #{currentTrips.length - idx}
                     </div>
                     <div>
                       <div className="text-sm font-bold text-white">S/ {Number(trip.ingresos).toFixed(2)}</div>
                       <div className="text-[10px] text-slate-400">
                          {trip.time} 
                          {Number(trip.yape) > 0 && <span className="text-purple-400 font-semibold ml-2">(S/ {Number(trip.yape).toFixed(2)} Yape)</span>}
                       </div>
                     </div>
                   </div>
                   <button onClick={() => deleteTrip(trip.id)} className="text-slate-500 hover:text-red-400 p-2">✕</button>
                 </div>

                 {Number(trip.gastoMonto) > 0 && (
                   <div className="mt-2 ml-12 bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex justify-between items-center">
                     <span className="text-[10px] text-red-300 uppercase font-bold">{trip.gastoDetalle || 'Gasto'}</span>
                     <span className="text-xs font-bold text-red-400">- S/ {Number(trip.gastoMonto).toFixed(2)}</span>
                   </div>
                 )}
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HistoryTab({ dailyHistory }) {
  const [expandedDayId, setExpandedDayId] = useState(null)
  if (dailyHistory.length === 0) {
    return (
      <div className="animate-in fade-in flex flex-col items-center justify-center h-[60vh] text-center">
         <History className="w-16 h-16 text-slate-700 mb-4" />
         <h2 className="text-xl font-bold text-slate-300">Historial Vacío</h2>
         <p className="text-sm text-slate-500 max-w-[200px] mt-2">Los días que liquides aparecerán registrados aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold text-white mb-2">Historial de Trabajo</h2>
      
      <div className="space-y-4">
        {dailyHistory.slice().reverse().map((day) => {
          const formattedDate = new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric'})
          const isExpanded = expandedDayId === day.id;

          return (
            <div key={day.id} className="glass-panel rounded-3xl border border-white/5 overflow-hidden transition-all duration-300">
               {/* Resumen del Día (Clickable) */}
               <div 
                 onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                 className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${isExpanded ? 'bg-slate-700/50 border-b border-white/10' : 'bg-slate-800/50 hover:bg-slate-800/70'}`}
               >
                 <div className="flex flex-col">
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{formattedDate}</span>
                   <span className="text-sm font-bold text-slate-200">{day.vueltasCount} vueltas</span>
                 </div>
                 <div className="text-right">
                   <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Líquido Dueño</span>
                   <div className="flex items-center gap-2 justify-end">
                      <span className="text-lg font-black text-emerald-400">S/ {Number(day.gananciaCarro).toFixed(2)}</span>
                      <span className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                   </div>
                 </div>
               </div>
               
               {/* Detalles Expandidos */}
               {isExpanded && (
                 <div className="animate-in slide-in-from-top-2 fade-in duration-300 origin-top">
                   <div className="p-4 grid grid-cols-2 gap-4 bg-slate-800/20">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Ingresos (Bruto)</div>
                        <div className="text-sm font-bold text-blue-300">S/ {Number(day.vueltasMontoTot).toFixed(2)}</div>
                        {day.totalYape > 0 && <div className="text-[9px] text-purple-400 font-bold uppercase">Yape: S/ {Number(day.totalYape).toFixed(2)}</div>}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Gastos (Gas + Comida...)</div>
                        <div className="text-sm font-bold text-orange-300">S/ {(Number(day.gasolina) + Number(day.almuerzo) + Number(day.tributo) + Number(day.gastosMenores || 0)).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Monto Libre Repar.</div>
                        <div className="text-sm font-bold text-slate-300">S/ {Number(day.montoLibre).toFixed(2)}</div>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Chofer</div>
                          <div className="text-sm font-bold text-slate-300">S/ {Number(day.chofer).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Cobrador</div>
                          <div className="text-sm font-bold text-slate-300">S/ {Number(day.cobrador).toFixed(2)}</div>
                        </div>
                      </div>
                   </div>

                   {/* Vueltas List for that day */}
                   {day.vueltas && day.vueltas.length > 0 && (
                     <div className="bg-slate-900/50 p-4 border-t border-white/5">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Detalle de Vueltas Registradas</div>
                        <div className="space-y-2">
                          {day.vueltas.map((vuelta, i) => (
                             <div key={vuelta.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <span className="text-slate-300 font-medium">#{i+1} - {vuelta.time}</span>
                                <div className="text-right">
                                  <span className="text-blue-300 font-bold block">S/ {Number(vuelta.ingresos).toFixed(2)}</span>
                                  {Number(vuelta.gastoMonto) > 0 && <span className="text-red-400 block text-[9px]">- S/ {Number(vuelta.gastoMonto).toFixed(2)} ({vuelta.gastoDetalle})</span>}
                                </div>
                             </div>
                          ))}
                        </div>
                     </div>
                   )}
                 </div>
               )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ExpenseForm({ expenses, setExpenses, dates, setDates, setActiveTab }) {
  // ExpenseForm is strictly for Maintenance / Emergencies now (Gas is in daily close)
  const [formData, setFormData] = useState({
    tipo: 'maintenance', monto: '', descripcion: '', fechaAlerta: ''
  })

  useEffect(() => {
    if(formData.tipo === 'maintenance') {
      const nextDate = new Date()
      nextDate.setMonth(nextDate.getMonth() + 2) 
      setFormData(prev => ({...prev, fechaAlerta: nextDate.toISOString().split('T')[0]}))
    } else if (formData.tipo === 'soat') {
      const nextDate = new Date()
      nextDate.setFullYear(nextDate.getFullYear() + 1) 
      setFormData(prev => ({...prev, fechaAlerta: nextDate.toISOString().split('T')[0]}))
    }
  }, [formData.tipo])

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value})

  const handleSubmit = () => {
    if(!formData.monto) return alert("Ingresa un monto")
    const newExpense = { id: Date.now().toString(), date: new Date().toISOString(), ...formData }
    setExpenses([...expenses, newExpense])

    if(formData.tipo === 'maintenance' && formData.fechaAlerta) setDates({...dates, maintenance: formData.fechaAlerta})
    else if (formData.tipo === 'soat' && formData.fechaAlerta) setDates({...dates, soat: formData.fechaAlerta})

    setFormData({ tipo: 'maintenance', monto: '', descripcion: '', fechaAlerta: '' })
  }

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const getTypeLabel = (type) => {
    const types = {
      'maintenance': 'Mantenimiento',
      'repair': 'Refacción',
      'soat': 'Trámite / SOAT',
      'other': 'Otro'
    }
    return types[type] || 'Gasto'
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold text-white mb-1">Costos Externos</h2>
      <p className="text-xs text-slate-400 mt-0 mb-3">(Mantenimientos, Emergencias mecánicas, Trámites)</p>
      
      <div className="glass-panel p-6 rounded-[2rem] space-y-5 border border-white/5 bg-slate-800/40">
        
        <div className="space-y-2">
          <label className="text-xs text-slate-400 ml-1 font-bold uppercase tracking-wider">Categoría</label>
          <div className="relative group">
             <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-4 text-white font-medium outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer">
               <option value="maintenance">Mantenimiento de Vehículo</option>
               <option value="repair">Refacción / Emergencia</option>
               <option value="soat">Pago SOAT u Oficios</option>
               <option value="other">Otro Gasto</option>
             </select>
             <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 ml-1 font-bold uppercase tracking-wider">Monto Total (S/)</label>
          <div className="relative group">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-lg">S/</span>
             <input name="monto" type="number" value={formData.monto} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-white text-lg font-bold outline-none focus:border-purple-500 transition-all" placeholder="0.00" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-slate-400 ml-1 font-bold uppercase tracking-wider">Descripción del gasto</label>
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-purple-500 transition-all resize-none font-medium" placeholder="Ej: Cambio de aceite..."></textarea>
        </div>

        { (formData.tipo === 'maintenance' || formData.tipo === 'soat') && (
           <div className="space-y-2 pt-2">
              <label className="text-xs text-purple-300 ml-1 font-bold uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Próxima Fecha de Alerta</label>
              <input name="fechaAlerta" type="date" value={formData.fechaAlerta} onChange={handleChange} className="w-full bg-purple-900/20 border border-purple-500/30 rounded-xl px-4 py-3 text-purple-100 font-medium outline-none focus:border-purple-500 transition-all" />
           </div>
        )}

        <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 active:scale-[0.98] transition-all text-white font-bold py-4 rounded-2xl mt-6 shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" /> Registrar Costo
        </button>
      </div>

      <div className="pt-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2 flex justify-between items-center">
          Historial de Gastos <span className="text-white bg-slate-800 px-2 py-0.5 rounded-full">{expenses.length}</span>
        </h3>
        
        {expenses.length === 0 ? (
          <div className="text-center py-10 bg-slate-800/20 border border-dashed border-white/10 rounded-3xl">
            <Wrench className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Aún no hay gastos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
             {expenses.slice().reverse().map((exp) => (
               <div key={exp.id} className="glass-panel p-4 rounded-2xl border border-white/5 flex justify-between items-center bg-slate-800/60">
                 <div className="flex-1">
                   <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{getTypeLabel(exp.tipo)}</span>
                      <span className="text-[10px] text-slate-400">{new Date(exp.date).toLocaleDateString()}</span>
                   </div>
                   <div className="text-sm font-bold text-white mb-0.5">S/ {Number(exp.monto).toFixed(2)}</div>
                   {exp.descripcion && <div className="text-xs text-slate-400 line-clamp-2">{exp.descripcion}</div>}
                 </div>
                 <button onClick={() => deleteExpense(exp.id)} className="text-slate-500 hover:text-red-400 p-2 ml-2">✕</button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
