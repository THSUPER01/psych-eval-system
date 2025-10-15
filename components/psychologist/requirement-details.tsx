"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data
const mockResponse = {
  CLB_EstadoCivil: "Soltero/a",
  CLB_Genero: "Masculino",
  edad_al_ingresar: "28",
  Barrio: "Chapinero",
  Comuna: "Comuna 2",
  Estrato: "3",
  Hijos: "Sí",
  numero_hijos: "2",
  edades_de_hijos: ["5", "8"],
  talla_camisa: "M",
  talla_pantalon: "32",
  talla_zapatos: "42",
}

const mockDocuments = [
  {
    id: "1",
    fileName: "Prueba_Psicotecnica_Resultado.pdf",
    uploadedAt: "2025-01-12",
    notes: "Resultados de prueba psicotécnica aplicada presencialmente",
  },
  {
    id: "2",
    fileName: "Entrevista_Inicial.pdf",
    uploadedAt: "2025-01-12",
    notes: "Notas de entrevista inicial",
  },
]

export function RequirementDetails({ requirementId }: { requirementId: string }) {
  const [documents, setDocuments] = useState(mockDocuments)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadNotes, setUploadNotes] = useState("")
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // TODO: Implement actual file upload to storage
    setTimeout(() => {
      const newDoc = {
        id: String(documents.length + 1),
        fileName: file.name,
        uploadedAt: new Date().toISOString().split("T")[0],
        notes: uploadNotes,
      }
      setDocuments([...documents, newDoc])
      setUploadNotes("")
      setIsUploading(false)
      toast({
        title: "Documento subido",
        description: `${file.name} se ha subido correctamente`,
      })
    }, 1500)
  }

  const handleDeleteDocument = (docId: string) => {
    setDocuments(documents.filter((doc) => doc.id !== docId))
    toast({
      title: "Documento eliminado",
      description: "El documento se ha eliminado correctamente",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">María González</CardTitle>
              <CardDescription>maria@email.com • +57 300 123 4567</CardDescription>
            </div>
            <Badge>
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              Completado
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="responses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="responses">Respuestas del Formulario</TabsTrigger>
          <TabsTrigger value="documents">Documentos y Pruebas</TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Candidato</CardTitle>
              <CardDescription>Datos recopilados del formulario completado el 12/01/2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(mockResponse).map(([key, value]) => {
                  // Format array values for better display
                  let displayValue = value
                  if (Array.isArray(value)) {
                    displayValue = value.length > 0 ? value.join(", ") : "N/A"
                  }
                  
                  // Skip internal fields like numero_hijos if you only want to show edades_de_hijos
                  if (key === "numero_hijos") return null

                  return (
                    <div key={key} className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                        {key.replace(/_/g, " ")}
                      </Label>
                      <p className="text-base font-medium">{String(displayValue)}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subir Nuevo Documento</CardTitle>
              <CardDescription>Sube pruebas psicotécnicas, entrevistas u otros documentos relacionados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notas del Documento</Label>
                <Textarea
                  id="notes"
                  placeholder="Descripción o notas sobre este documento..."
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="flex-1"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos Subidos ({documents.length})</CardTitle>
              <CardDescription>Historial de documentos y pruebas del candidato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-primary/10 p-2 rounded">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">{doc.notes}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Subido el {new Date(doc.uploadedAt).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
