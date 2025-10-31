"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function Page() {
  const { toast } = useToast()
  const router = useRouter()

  const [companyName, setCompanyName] = useState("")
  const [enableEmails, setEnableEmails] = useState(true)
  const [defaultMunicipio, setDefaultMunicipio] = useState("Manizales")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("selection-config")
      if (raw) {
        const parsed = JSON.parse(raw)
        setCompanyName(parsed.companyName || "")
        setEnableEmails(typeof parsed.enableEmails === "boolean" ? parsed.enableEmails : true)
        setDefaultMunicipio(parsed.defaultMunicipio || "Manizales")
      }
    } catch (e) {
      console.error("Failed to read selection-config from localStorage", e)
    }
  }, [])

  const handleSave = () => {
    const payload = { companyName, enableEmails, defaultMunicipio }
    try {
      localStorage.setItem("selection-config", JSON.stringify(payload))
      toast({ title: "Guardado", description: "Configuración guardada localmente." })
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" })
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <nav className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/psychologist/dashboard">Dashboard</Link>
        <span>/</span>
        <Link href="/psychologist/dashboard/selection">Selection</Link>
        <span>/</span>
        <span className="font-semibold">Configuración</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle>Configuración - Selección</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Nombre de la compañía</Label>
              <Input
                placeholder="Ej: Super de Alimentos S.A."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <Label>Notificaciones por correo</Label>
              <div className="mt-2 flex items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableEmails}
                    onChange={(e) => setEnableEmails(e.target.checked)}
                    className="h-4 w-4 rounded border"
                  />
                  <span className="text-sm">Habilitar notificaciones por email</span>
                </label>
              </div>
            </div>

            <div>
              <Label>Municipio por defecto</Label>
              <select
                className="mt-2 block w-full rounded border bg-white px-3 py-2"
                value={defaultMunicipio}
                onChange={(e) => setDefaultMunicipio(e.target.value)}
              >
                <option>Manizales</option>
                <option>Villamaría</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => router.back()}>
                Volver
              </Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
