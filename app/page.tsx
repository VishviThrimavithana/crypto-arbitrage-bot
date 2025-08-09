"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Play, Pause, RefreshCw, Shield, Rocket, Activity, DollarSign, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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

export default function Page() {
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
      console.log("Fetching opportunities with threshold:", res)
      // debugger
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // auto-execute if top op is profitable
    if (!auto || topOps.length === 0 || executing) return
    const best = topOps[0]
    // prevent too frequent submissions
    const t = setTimeout(() => {
      execute(best)
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, topOps, executing])

   const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      setThreshold(value)
    }
  }

  return (
  <main className="min-h-screen w-full bg-gradient-to-r from-[#0f2027] via-[#2c5364] to-[#00f5a0]">

      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <header className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-green-600" />
          <h1 className="text-xl md:text-2xl font-semibold text-white dark:text-gray-900">
            Multi-Chain Arbitrage Bot
          </h1>
          <Badge variant="secondary" className="ml-auto">
            Demo
          </Badge>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4" />
                Controls
              </CardTitle>
              <CardDescription>Configure scan and execution</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="threshold">Min Diff %</Label>
                <div className="flex items-center gap-2">
                  <Input
            id="threshold"
            type="number"
            step="0.1"
            min="0"
            value={threshold}
            onChange={handleThresholdChange}
          />
                  <Button variant="outline" size="icon" onClick={() => setThreshold(0.5)} title="Reset">
                   <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Trade Size (Quote)</Label>
                <Input id="size" value={size} onChange={(e) => setSize(Number.parseFloat(e.target.value || "0"))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="refresh">Refresh ms</Label>
                <Input
                  id="refresh"
                  value={refreshMs}
                  onChange={(e) => setRefreshMs(Number.parseInt(e.target.value || "0"))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Auto Scan</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={auto} onCheckedChange={setAuto} />
                  <span className="text-sm text-muted-foreground">{auto ? "On" : "Off"}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>DRY RUN</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={dryRun} onCheckedChange={setDryRun} />
                  <span className="text-sm text-muted-foreground">{dryRun ? "Simulation" : "Live (danger)"}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Actions</Label>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={fetchOps} disabled={loading} variant="default">
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Refresh
                  </Button>
                  <Button onClick={simulateProfit} variant="secondary">
                    <Rocket className="h-4 w-4 mr-2" />
                    Simulate Profit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Summary
              </CardTitle>
              <CardDescription>Top opportunity snapshot</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Found</span>
                <span className="font-semibold">{ops.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Above threshold</span>
                <span className="font-semibold">{topOps.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Best profit (est.)</span>
                <span className="font-semibold">{topOps[0] ? `$${topOps[0].estProfitUsd.toFixed(2)}` : "$0.00"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="font-semibold">{loading ? "Scanning..." : "Idle"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
              <CardDescription>Keys never leave the server</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-2">
                {
                  "Private keys and API secrets are read as server-side environment variables only and are not exposed to the client."
                }
              </p>
              <p className="mb-2">{"Keep DRY_RUN=true until you fully test on testnets or paper trade on CEX APIs."}</p>
              <p>{"Use a dedicated wallet, strict API permissions, and withdrawal allowlists."}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Real-time Opportunities</CardTitle>
            <CardDescription>Buy low, sell high across CEXs and DEXs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pair</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Buy On</TableHead>
                    <TableHead>Sell On</TableHead>
                    <TableHead>Buy</TableHead>
                    <TableHead>Sell</TableHead>
                    <TableHead>Diff %</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Gas</TableHead>
                    <TableHead>Est. Profit</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ops.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                        {loading ? "Scanning..." : "No opportunities yet."}
                      </TableCell>
                    </TableRow>
                  )}
                  {ops.map((o) => (
                    <TableRow
                      key={o.id}
                      className={cn(
                        o.diffPct >= threshold && o.estProfitUsd > 0 ? "bg-green-50/50 dark:bg-green-950/20" : "",
                      )}
                    >
                      <TableCell className="font-medium">
                        {o.base}/{o.quote}
                      </TableCell>
                      <TableCell>{o.chain.toUpperCase()}</TableCell>
                      <TableCell>{o.buyOn}</TableCell>
                      <TableCell>{o.sellOn}</TableCell>
                      <TableCell>${o.buyPrice.toFixed(4)}</TableCell>
                      <TableCell>${o.sellPrice.toFixed(4)}</TableCell>
                      <TableCell
                        className={cn(
                          o.diffPct >= threshold ? "text-green-600 font-semibold" : "text-muted-foreground",
                        )}
                      >
                        {o.diffPct.toFixed(2)}%
                      </TableCell>
                      <TableCell>${o.feesUsd.toFixed(2)}</TableCell>
                      <TableCell>${o.gasUsd.toFixed(2)}</TableCell>
                      <TableCell
                        className={cn(
                          o.estProfitUsd > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold",
                        )}
                      >
                        ${o.estProfitUsd.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="default"
                          disabled={executing === o.id || o.diffPct < threshold}
                          onClick={() => execute(o)}
                        >
                          {executing === o.id ? (
                            <Pause className="h-4 w-4 mr-1 animate-pulse" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          {executing === o.id ? "Running..." : "Execute"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
