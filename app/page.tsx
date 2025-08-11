"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Play, Pause, RefreshCw, Shield, Rocket, Activity, DollarSign, Settings2, TrendingUp, Zap, Target, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type Opportunity = {
  id: string
  base: string
  quote: string
  chain: string
  buyOn: string
  sellOn: string
  buyPrice: number
  sellPrice: number
  diffPct: number
  estProfitUsd: number
  sizeQuote: number
  feesUsd: number
  gasUsd: number
  slippagePct: number
  timestamp: number
}

export default function CyberpunkArbitrageBot() {
  const [ops, setOps] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [auto, setAuto] = useState(false)
  const [threshold, setThreshold] = useState<number>(0.5)
  const [size, setSize] = useState<number>(1000)
  const [refreshMs, setRefreshMs] = useState<number>(5000)
  const [executing, setExecuting] = useState<string | null>(null)
  const [dryRun, setDryRun] = useState<boolean>(true)
  const timerRef = useRef<any>(null)

  const topOps = useMemo(() => {
    return ops
      .filter((o) => o.diffPct >= threshold && o.estProfitUsd > 0)
      .sort((a, b) => b.estProfitUsd - a.estProfitUsd)
  }, [ops, threshold])

  const fetchOps = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/opportunities?threshold=${threshold}&sizeQuote=${size}`, { cache: "no-store" })
      const data = await res.json()
      setOps(data.opportunities ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const execute = async (op: Opportunity) => {
    setExecuting(op.id)
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: op.id, dryRun }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(`Execution failed: ${data.error || "Unknown error"}`)
      } else {
        alert(`Execution ${dryRun ? "simulated" : "submitted"}: ${data.status} - ${data.message}`)
      }
    } catch (e: any) {
      alert(`Execution error: ${e?.message || "Unknown"}`)
    } finally {
      setExecuting(null)
      fetchOps()
    }
  }

  const simulateProfit = async () => {
    try {
      const res = await fetch("/api/simulate", { method: "POST" })
      const data = await res.json()
      alert(data.message || "Simulation done")
      fetchOps()
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchOps()
  }, [threshold, size])

  useEffect(() => {
    if (auto) {
      timerRef.current = setInterval(async () => {
        await fetchOps()
      }, refreshMs)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [auto, refreshMs])

  useEffect(() => {
    if (!auto || topOps.length === 0 || executing) return
    const best = topOps[0]
    const t = setTimeout(() => {
      execute(best)
    }, 250)
    return () => clearTimeout(t)
  }, [auto, topOps, executing])

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      setThreshold(value)
    }
  }

  return (
    <div className="min-h-screen font-['Rajdhani'] bg-[#1a1a2e] text-[#f5f5f5] relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,0,204,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,204,0.1) 1px, transparent 1px),
            linear-gradient(rgba(255,0,204,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,204,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px'
        }}></div>
      </div>

      {/* Animated Neon Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ff00cc] to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent animate-pulse"></div>
        <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#f7ff00] to-transparent animate-pulse"></div>
        <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#ff00cc] to-transparent animate-pulse"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-4 md:p-6">
        {/* Cyberpunk Header */}
        <header className="flex items-center gap-4 mb-8 p-4 rounded-lg border border-[#ff00cc]/20 bg-[#1a1a2e]/80 backdrop-blur-sm shadow-[0_0_20px_rgba(255,0,204,0.1)]">
          <div className="relative">
            <Activity className="h-8 w-8 text-[#00f5ff]" />
            <div className="absolute -inset-1 bg-[#00f5ff]/20 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#ff00cc] via-[#00f5ff] to-[#f7ff00] bg-clip-text text-transparent">
              ARBITRAGE_NEXUS.EXE
            </h1>
            <p className="text-sm text-[#f5f5f5]/60 font-mono">Multi-Chain Trading Protocol v2.1.0</p>
          </div>
          <div className="px-3 py-1 rounded-full border border-[#f7ff00] bg-[#f7ff00]/10 text-[#f7ff00] text-sm font-mono animate-pulse">
            [DEMO_MODE]
          </div>
        </header>

        {/* Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Controls Panel */}
          <div className="p-6 rounded-lg border border-[#ff00cc]/30 bg-[#1a1a2e]/60 backdrop-blur-sm shadow-[0_0_30px_rgba(255,0,204,0.1)] hover:shadow-[0_0_40px_rgba(255,0,204,0.15)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Settings2 className="h-5 w-5 text-[#ff00cc]" />
              <h2 className="text-lg font-bold text-[#ff00cc]">CONTROL_MATRIX</h2>
            </div>
            <p className="text-sm text-[#f5f5f5]/60 mb-6 font-mono">Configure scan parameters</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-mono text-[#00f5ff]">MIN_DIFF_%</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={threshold}
                    onChange={handleThresholdChange}
                    className="flex-1 p-2 rounded bg-[#1a1a2e] border border-[#00f5ff]/30 text-[#f5f5f5] focus:border-[#00f5ff] focus:outline-none focus:shadow-[0_0_10px_rgba(0,245,255,0.3)] transition-all font-mono"
                  />
                  <button 
                    onClick={() => setThreshold(0.5)}
                    className="p-2 rounded border border-[#f7ff00]/30 bg-[#f7ff00]/10 text-[#f7ff00] hover:bg-[#f7ff00]/20 transition-all"
                    title="Reset"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-mono text-[#00f5ff]">TRADE_SIZE</label>
                <input
                  value={size}
                  onChange={(e) => setSize(Number.parseFloat(e.target.value || "0"))}
                  className="w-full p-2 rounded bg-[#1a1a2e] border border-[#00f5ff]/30 text-[#f5f5f5] focus:border-[#00f5ff] focus:outline-none focus:shadow-[0_0_10px_rgba(0,245,255,0.3)] transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-mono text-[#00f5ff]">REFRESH_MS</label>
                <input
                  value={refreshMs}
                  onChange={(e) => setRefreshMs(Number.parseInt(e.target.value || "0"))}
                  className="w-full p-2 rounded bg-[#1a1a2e] border border-[#00f5ff]/30 text-[#f5f5f5] focus:border-[#00f5ff] focus:outline-none focus:shadow-[0_0_10px_rgba(0,245,255,0.3)] transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-mono text-[#00f5ff]">AUTO_SCAN</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAuto(!auto)}
                    className={`relative w-12 h-6 rounded-full transition-all ${auto ? 'bg-[#00f5ff]' : 'bg-[#1a1a2e] border border-[#00f5ff]/30'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${auto ? 'left-7 bg-[#1a1a2e]' : 'left-1 bg-[#00f5ff]'}`}></div>
                  </button>
                  <span className="text-sm font-mono text-[#f5f5f5]/80">[{auto ? 'ACTIVE' : 'INACTIVE'}]</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-mono text-[#f7ff00]">DRY_RUN</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDryRun(!dryRun)}
                    className={`relative w-12 h-6 rounded-full transition-all ${dryRun ? 'bg-[#f7ff00]' : 'bg-[#ff00cc]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${dryRun ? 'left-7 bg-[#1a1a2e]' : 'left-1 bg-[#1a1a2e]'}`}></div>
                  </button>
                  <span className="text-sm font-mono text-[#f5f5f5]/80">[{dryRun ? 'SIMULATION' : 'LIVE_DANGER'}]</span>
                </div>
              </div>

              <div className="space-y-2 col-span-full">
                <label className="text-sm font-mono text-[#00f5ff]">ACTIONS</label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={fetchOps}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-[#ff00cc] to-[#ff00cc]/80 text-[#f5f5f5] hover:from-[#ff00cc]/80 hover:to-[#ff00cc] disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(255,0,204,0.3)] hover:shadow-[0_0_20px_rgba(255,0,204,0.5)] font-mono"
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    REFRESH
                  </button>
                  <button
                    onClick={simulateProfit}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-[#00f5ff] to-[#00f5ff]/80 text-[#1a1a2e] hover:from-[#00f5ff]/80 hover:to-[#00f5ff] transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:shadow-[0_0_20px_rgba(0,245,255,0.5)] font-mono font-bold"
                  >
                    <Rocket className="h-4 w-4" />
                    SIMULATE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="p-6 rounded-lg border border-[#00f5ff]/30 bg-[#1a1a2e]/60 backdrop-blur-sm shadow-[0_0_30px_rgba(0,245,255,0.1)] hover:shadow-[0_0_40px_rgba(0,245,255,0.15)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-[#00f5ff]" />
              <h2 className="text-lg font-bold text-[#00f5ff]">PROFIT_MATRIX</h2>
            </div>
            <p className="text-sm text-[#f5f5f5]/60 mb-6 font-mono">Real-time opportunity scan</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded bg-[#1a1a2e]/80 border border-[#ff00cc]/20">
                <span className="font-mono text-[#f5f5f5]/80">OPPORTUNITIES_FOUND</span>
                <span className="font-bold text-[#ff00cc] text-lg">{ops.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-[#1a1a2e]/80 border border-[#00f5ff]/20">
                <span className="font-mono text-[#f5f5f5]/80">ABOVE_THRESHOLD</span>
                <span className="font-bold text-[#00f5ff] text-lg">{topOps.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-[#1a1a2e]/80 border border-[#f7ff00]/20">
                <span className="font-mono text-[#f5f5f5]/80">MAX_PROFIT_USD</span>
                <span className="font-bold text-[#f7ff00] text-lg">${topOps[0]?.estProfitUsd.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-[#1a1a2e]/80 border border-[#ff00cc]/20">
                <span className="font-mono text-[#f5f5f5]/80">SYSTEM_STATUS</span>
                <span className={cn("font-bold text-lg", loading ? "text-[#f7ff00] animate-pulse" : "text-[#00f5ff]")}>
                  {loading ? '[SCANNING...]' : '[IDLE]'}
                </span>
              </div>
            </div>
          </div>

          {/* Security Panel */}
          <div className="p-6 rounded-lg border border-[#f7ff00]/30 bg-[#1a1a2e]/60 backdrop-blur-sm shadow-[0_0_30px_rgba(247,255,0,0.1)] hover:shadow-[0_0_40px_rgba(247,255,0,0.15)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-[#f7ff00]" />
              <h2 className="text-lg font-bold text-[#f7ff00]">SECURITY_PROTOCOL</h2>
            </div>
            <p className="text-sm text-[#f5f5f5]/60 mb-6 font-mono">Encrypted key management</p>
            
            <div className="space-y-4 text-sm font-mono">
              <div className="p-3 rounded bg-[#1a1a2e]/80 border border-[#f7ff00]/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-[#ff00cc]" />
                  <span className="text-[#ff00cc] font-bold">ENCRYPTION_STATUS</span>
                </div>
                <p className="text-[#f5f5f5]/80">Private keys stored server-side only. Zero client exposure.</p>
              </div>
              
              <div className="p-3 rounded bg-[#1a1a2e]/80 border border-[#00f5ff]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-[#00f5ff]" />
                  <span className="text-[#00f5ff] font-bold">SAFETY_PROTOCOL</span>
                </div>
                <p className="text-[#f5f5f5]/80">Maintain DRY_RUN=true for all testing phases.</p>
              </div>
              
              <div className="p-3 rounded bg-[#1a1a2e]/80 border border-[#ff00cc]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-[#ff00cc]" />
                  <span className="text-[#ff00cc] font-bold">ACCESS_CONTROL</span>
                </div>
                <p className="text-[#f5f5f5]/80">Use dedicated wallets with strict API permissions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="p-6 rounded-lg border border-[#ff00cc]/20 bg-[#1a1a2e]/60 backdrop-blur-sm shadow-[0_0_30px_rgba(255,0,204,0.1)]">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="h-6 w-6 text-[#f7ff00]" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#ff00cc] to-[#00f5ff] bg-clip-text text-transparent">ARBITRAGE_OPPORTUNITIES</h2>
            <div className="ml-auto px-3 py-1 rounded-full border border-[#00f5ff] bg-[#00f5ff]/10 text-[#00f5ff] text-sm font-mono">
              Real-time CEX/DEX Scanner
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#ff00cc]/30">
                  <th className="text-left p-3 font-mono text-[#ff00cc]">PAIR</th>
                  <th className="text-left p-3 font-mono text-[#ff00cc]">CHAIN</th>
                  <th className="text-left p-3 font-mono text-[#ff00cc]">BUY_ON</th>
                  <th className="text-left p-3 font-mono text-[#ff00cc]">SELL_ON</th>
                  <th className="text-left p-3 font-mono text-[#ff00cc]">BUY_PRICE</th>
                  <th className="text-left p-3 font-mono text-[#ff00cc]">SELL_PRICE</th>
                  <th className="text-left p-3 font-mono text-[#ff00cc]">DIFF_%</th>
                  <th className="text-left p-3 font-mono text-[#ff00cc]">FEES</th>
                  <th className="text-left p-3 font-mono text-[#ff00cc]">GAS</th>
                  <th className="text-left p-3 font-mono text-[#ff00cc]">PROFIT_EST</th>
                  <th className="text-right p-3 font-mono text-[#ff00cc]">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {ops.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-[#f5f5f5]/60 font-mono">
                      {loading ? '[SCANNING_NETWORKS...]' : '[NO_OPPORTUNITIES_DETECTED]'}
                    </td>
                  </tr>
                ) : (
                  ops.map((op) => (
                    <tr
                      key={op.id}
                      className={cn(
                        "border-b border-[#ff00cc]/10 hover:bg-[#ff00cc]/5 transition-all",
                        op.diffPct >= threshold && op.estProfitUsd > 0 && 
                        "bg-gradient-to-r from-[#00f5ff]/10 to-transparent border-[#00f5ff]/30"
                      )}
                    >
                      <td className="p-3 font-mono font-bold text-[#f5f5f5]">
                        {op.base}/{op.quote}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded bg-[#f7ff00]/20 text-[#f7ff00] text-xs font-mono">
                          {op.chain.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[#00f5ff]">{op.buyOn}</td>
                      <td className="p-3 font-mono text-[#ff00cc]">{op.sellOn}</td>
                      <td className="p-3 font-mono text-[#f5f5f5]">${op.buyPrice.toFixed(4)}</td>
                      <td className="p-3 font-mono text-[#f5f5f5]">${op.sellPrice.toFixed(4)}</td>
                      <td className={cn(
                        "p-3 font-mono font-bold",
                        op.diffPct >= threshold ? "text-[#00f5ff]" : "text-[#f5f5f5]/60"
                      )}>
                        {op.diffPct.toFixed(2)}%
                      </td>
                      <td className="p-3 font-mono text-[#f5f5f5]/80">${op.feesUsd.toFixed(2)}</td>
                      <td className="p-3 font-mono text-[#f5f5f5]/80">${op.gasUsd.toFixed(2)}</td>
                      <td className={cn(
                        "p-3 font-mono font-bold",
                        op.estProfitUsd > 0 ? "text-[#f7ff00]" : "text-[#ff00cc]"
                      )}>
                        ${op.estProfitUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          disabled={executing === op.id || op.diffPct < threshold}
                          onClick={() => execute(op)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded font-mono text-sm transition-all",
                            executing === op.id
                              ? "bg-[#f7ff00]/20 text-[#f7ff00] animate-pulse"
                              : op.diffPct < threshold
                              ? "bg-[#1a1a2e] border border-[#ff00cc]/20 text-[#f5f5f5]/40"
                              : "bg-gradient-to-r from-[#00f5ff] to-[#00f5ff]/80 text-[#1a1a2e] hover:from-[#00f5ff]/80 hover:to-[#00f5ff] shadow-[0_0_10px_rgba(0,245,255,0.3)]"
                          )}
                        >
                          {executing === op.id ? (
                            <>
                              <Pause className="h-4 w-4 animate-pulse" />
                              EXECUTING
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              EXECUTE
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}