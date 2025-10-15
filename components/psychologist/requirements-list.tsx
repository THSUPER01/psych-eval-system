"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Clock, CheckCircle2, Mail, Phone } from "lucide-react"
import Link from "next/link"

// Mock data - replace with actual API call
const mockRequirements = [
  {
    id: "1",
    candidateName: "María González",
    candidateEmail: "maria@email.com",
    candidatePhone: "+57 300 123 4567",
    status: "completed",
    createdAt: "2025-01-10",
    submittedAt: "2025-01-12",
  },
  {
    id: "2",
    candidateName: "Carlos Rodríguez",
    candidateEmail: "carlos@email.com",
    candidatePhone: "+57 301 234 5678",
    status: "pending",
    createdAt: "2025-01-14",
    submittedAt: null,
  },
  {
    id: "3",
    candidateName: "Ana Martínez",
    candidateEmail: "ana@email.com",
    candidatePhone: "+57 302 345 6789",
    status: "completed",
    createdAt: "2025-01-08",
    submittedAt: "2025-01-09",
  },
]

export function RequirementsList() {
  const [requirements] = useState(mockRequirements)

  return (
    <div className="grid gap-4">
      {requirements.map((req) => (
        <Card key={req.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-1">{req.candidateName}</CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {req.candidateEmail}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {req.candidatePhone}
                  </div>
                </CardDescription>
              </div>
              <Badge variant={req.status === "completed" ? "default" : "secondary"} className="ml-4">
                {req.status === "completed" ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completado
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    Pendiente
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>Creado: {new Date(req.createdAt).toLocaleDateString("es-ES")}</p>
                {req.submittedAt && <p>Enviado: {new Date(req.submittedAt).toLocaleDateString("es-ES")}</p>}
              </div>
              <div className="flex gap-2">
                {req.status === "completed" && (
                  <Button asChild variant="outline">
                    <Link href={`/psychologist/requirement/${req.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Respuestas
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href={`/psychologist/requirement/${req.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Documentos
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
