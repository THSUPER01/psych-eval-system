"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, Sparkles, Shield, Settings, Workflow } from "lucide-react"

const CONFIG_KEY = "selection-config-v1"

const ConfigSchema = z.object({
	general: z.object({
		companyName: z.string().min(2).max(80),
		defaultMunicipio: z.enum(["Manizales", "Villamaría"]).default("Manizales"),
		requireComuna: z.boolean().default(true),
	}),
	notifications: z.object({
		enableEmails: z.boolean(),
		emailFrom: z.string().email(),
		inviteTemplate: z.string().min(10),
		tokenExpirationDays: z.number().min(1).max(30),
	}),
	forms: z.object({
		askHijos: z.boolean(),
		requireDireccion: z.boolean(),
		enableVillamaria: z.boolean(),
	}),
	appearance: z.object({
		logoUrl: z.string().url().optional().or(z.literal("")),
		primaryColor: z.string().min(3),
	}),
})

type Config = z.infer<typeof ConfigSchema>

const DEFAULT_CONFIG: Config = {
  general: {
    companyName: "Mundo Súper",
    defaultMunicipio: "Manizales",
    requireComuna: true,
  },
  notifications: {
    enableEmails: true,
    emailFrom: "seleccion@mundosuper.com",
    inviteTemplate:
      "Hola {{NOMBRE}}, te invitamos a completar tu evaluación. Usa este enlace: {{LINK}}. Vence en {{DIAS}} días.",
    tokenExpirationDays: 7,
  },
  forms: {
    askHijos: true,
    requireDireccion: true,
    enableVillamaria: true,
  },
  appearance: {
	logoUrl: "/images/Logo.png",
	primaryColor: "#0046BE",
  },
};

function useConfig() {
	const { toast } = useToast()
	const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		try {
			const raw = localStorage.getItem(CONFIG_KEY)
			if (raw) {
				const parsed = JSON.parse(raw)
				const safe = ConfigSchema.safeParse(parsed)
				if (safe.success) {
					setConfig(safe.data)
				} else {
					console.warn("Config inválida, usando valores por defecto", safe.error)
				}
			}
		} catch (e) {
			console.error("No se pudo cargar la configuración", e)
		} finally {
			setLoaded(true)
		}
	}, [])

	const save = () => {
		const safe = ConfigSchema.safeParse(config)
		if (!safe.success) {
			toast({ title: "Error de validación", description: "Revisa los campos del formulario.", variant: "destructive" })
			return false
		}
		localStorage.setItem(CONFIG_KEY, JSON.stringify(safe.data))
		toast({ title: "Configuración guardada", description: "Los cambios se guardaron localmente." })
		return true
	}

	const reset = () => {
		setConfig(DEFAULT_CONFIG)
		toast({ title: "Valores restablecidos", description: "Se restauraron los valores por defecto." })
	}

	return { config, setConfig, save, reset, loaded }
}

export default function ConfiguracionPage() {
	const { config, setConfig, save, reset, loaded } = useConfig()
	const { toast } = useToast()

	const emailPreview = useMemo(() => {
		return config.notifications.inviteTemplate
			.replace("{{NOMBRE}}", "María Pérez")
			.replace("{{LINK}}", "https://app.superdealimentos.com/candidato/XYZ123")
			.replace("{{DIAS}}", String(config.notifications.tokenExpirationDays))
	}, [config.notifications.inviteTemplate, config.notifications.tokenExpirationDays])

	if (!loaded) {
		return (
			<div className="space-y-4">
				<div className="h-8 w-48 bg-muted animate-pulse rounded" />
				<div className="grid gap-4 md:grid-cols-3">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="h-48 bg-muted animate-pulse rounded" />
					))}
				</div>
			</div>
		)
	}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0046BE] to-[#00AEEF] bg-clip-text text-transparent">
          Configuración
        </h1>
        <p className="text-gray-600 mt-1">Ajusta los parámetros del módulo de selección.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-2 border-gray-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#E6F2FF] to-white rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-[#0046BE]">
                <Settings className="h-5 w-5" /> Preferencias
              </CardTitle>
              <CardDescription>Configura valores generales, formularios y notificaciones.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-6 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0046BE] data-[state=active]:to-[#00AEEF] data-[state=active]:text-white">General</TabsTrigger>
                  <TabsTrigger value="formularios" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0046BE] data-[state=active]:to-[#00AEEF] data-[state=active]:text-white">Formularios</TabsTrigger>
                  <TabsTrigger value="notificaciones" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0046BE] data-[state=active]:to-[#00AEEF] data-[state=active]:text-white">Notificaciones</TabsTrigger>
                  <TabsTrigger value="apariencia" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0046BE] data-[state=active]:to-[#00AEEF] data-[state=active]:text-white">Apariencia</TabsTrigger>
                </TabsList>								<TabsContent value="general" className="space-y-6">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label>Nombre de la compañía</Label>
											<Input
												value={config.general.companyName}
												onChange={(e) => setConfig({ ...config, general: { ...config.general, companyName: e.target.value } })}
												placeholder="Ej: Super de Alimentos S.A."
											/>
										</div>
										<div className="space-y-2">
											<Label>Municipio por defecto</Label>
											<Select
												value={config.general.defaultMunicipio}
												onValueChange={(v) => setConfig({ ...config, general: { ...config.general, defaultMunicipio: v as Config["general"]["defaultMunicipio"] } })}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona municipio" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Manizales">Manizales</SelectItem>
													<SelectItem value="Villamaría">Villamaría</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="flex items-center justify-between rounded-md border p-4">
										<div>
											<Label className="font-medium">Exigir Comuna en Manizales</Label>
											<p className="text-sm text-muted-foreground">Solicita la comuna cuando el municipio sea Manizales.</p>
										</div>
										<Switch
											checked={config.general.requireComuna}
											onCheckedChange={(v) => setConfig({ ...config, general: { ...config.general, requireComuna: v } })}
										/>
									</div>
								</TabsContent>

								<TabsContent value="formularios" className="space-y-6">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="flex items-center justify-between rounded-md border p-4">
											<div>
												<Label className="font-medium">Preguntar por hijos</Label>
												<p className="text-sm text-muted-foreground">Activa el bloque de edades e hijos.</p>
											</div>
											<Switch
												checked={config.forms.askHijos}
												onCheckedChange={(v) => setConfig({ ...config, forms: { ...config.forms, askHijos: v } })}
											/>
										</div>
										<div className="flex items-center justify-between rounded-md border p-4">
											<div>
												<Label className="font-medium">Dirección obligatoria</Label>
												<p className="text-sm text-muted-foreground">Requerir campo "Dirección" en formularios.</p>
											</div>
											<Switch
												checked={config.forms.requireDireccion}
												onCheckedChange={(v) => setConfig({ ...config, forms: { ...config.forms, requireDireccion: v } })}
											/>
										</div>
										<div className="flex items-center justify-between rounded-md border p-4 md:col-span-2">
											<div>
												<Label className="font-medium">Habilitar Villamaría</Label>
												<p className="text-sm text-muted-foreground">Permite seleccionar barrios de Villamaría.</p>
											</div>
											<Switch
												checked={config.forms.enableVillamaria}
												onCheckedChange={(v) => setConfig({ ...config, forms: { ...config.forms, enableVillamaria: v } })}
											/>
										</div>
									</div>
								</TabsContent>

								<TabsContent value="notificaciones" className="space-y-6">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="flex items-center justify-between rounded-md border p-4 md:col-span-2">
											<div>
												<Label className="font-medium">Activar correos</Label>
												<p className="text-sm text-muted-foreground">Habilita el envío de invitaciones por email.</p>
											</div>
											<Switch
												checked={config.notifications.enableEmails}
												onCheckedChange={(v) => setConfig({ ...config, notifications: { ...config.notifications, enableEmails: v } })}
											/>
										</div>

										<div className="space-y-2">
											<Label>Remitente (From)</Label>
											<Input
												type="email"
												value={config.notifications.emailFrom}
												onChange={(e) => setConfig({ ...config, notifications: { ...config.notifications, emailFrom: e.target.value } })}
												placeholder="nombre@empresa.com"
											/>
										</div>
										<div className="space-y-2">
											<Label>Vencimiento de enlace (días)</Label>
											<Input
												type="number"
												min={1}
												max={30}
												value={config.notifications.tokenExpirationDays}
												onChange={(e) => setConfig({ ...config, notifications: { ...config.notifications, tokenExpirationDays: Number(e.target.value || 1) } })}
											/>
										</div>

										<div className="space-y-2 md:col-span-2">
											<Label>Plantilla de invitación</Label>
											<Textarea
												rows={5}
												value={config.notifications.inviteTemplate}
												onChange={(e) => setConfig({ ...config, notifications: { ...config.notifications, inviteTemplate: e.target.value } })}
											/>
											  <p className="text-xs text-muted-foreground">Variables disponibles: {"{{NOMBRE}}"}, {"{{LINK}}"}, {"{{DIAS}}"}</p>
										</div>
									</div>
								</TabsContent>

								<TabsContent value="apariencia" className="space-y-6">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label>Logo (URL)</Label>
											<Input
												value={config.appearance.logoUrl || ""}
												onChange={(e) => setConfig({ ...config, appearance: { ...config.appearance, logoUrl: e.target.value } })}
												placeholder="https://.../logo.png"
											/>
										</div>
										<div className="space-y-2">
											<Label>Color primario</Label>
											<Input
												type="color"
												value={config.appearance.primaryColor}
												onChange={(e) => setConfig({ ...config, appearance: { ...config.appearance, primaryColor: e.target.value } })}
											/>
										</div>
									</div>
								</TabsContent>
							</Tabs>

							<Separator className="my-6" />
							<div className="flex items-center justify-end gap-3">
								<Button variant="outline" onClick={reset}>Restablecer</Button>
								<Button onClick={() => save()}>Guardar cambios</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Vista previa y utilidades */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><Workflow className="h-5 w-5" /> Resumen</CardTitle>
							<CardDescription>Estado actual de la configuración</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Compañía</span>
								<span className="text-sm font-medium">{config.general.companyName}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Municipio</span>
								<Badge variant="secondary">{config.general.defaultMunicipio}</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Emails</span>
								<Badge>{config.notifications.enableEmails ? "Habilitados" : "Deshabilitados"}</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Token</span>
								<span className="text-sm font-medium">{config.notifications.tokenExpirationDays} días</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Dirección requerida</span>
								<Badge variant={config.forms.requireDireccion ? "default" : "secondary"}>
									{config.forms.requireDireccion ? "Sí" : "No"}
								</Badge>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Vista previa de invitación</CardTitle>
							<CardDescription>Así verán el correo los candidatos</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="rounded-md border p-3 bg-white">
								<p className="text-sm whitespace-pre-wrap">{emailPreview}</p>
							</div>
							<div className="flex items-center justify-end gap-2">
								<Button
									variant="outline"
									onClick={() => {
										navigator.clipboard.writeText(emailPreview)
										toast({ title: "Copiado", description: "Plantilla copiada al portapapeles." })
									}}
								>
									Copiar
								</Button>
								<Button
									onClick={() => toast({ title: "Simulado", description: "Se envió un correo de prueba (simulado)." })}
								>
									Enviar prueba
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Seguridad</CardTitle>
							<CardDescription>Buenas prácticas y recordatorios</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2 text-sm text-muted-foreground">
							<p>• No compartas enlaces de invitación públicamente.</p>
							<p>• Mantén actualizado el tiempo de vencimiento según tu flujo.</p>
							<p>• La integración real de correo se implementará en backend.</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

