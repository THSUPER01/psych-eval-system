import Link from "next/link"
import Image from "next/image"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen relative bg-gradient-to-br from-background via-secondary/20 to-background overflow-hidden">
      {/* Imágenes decorativas */}
      <Image
        src="/images/Recurso 1@2x.png"
        alt=""
        width={220}
        height={220}
        className="absolute left-0 top-0 opacity-30 pointer-events-none select-none hidden md:block"
      />
      <Image
        src="/images/Recurso 2@2x.png"
        alt=""
        width={180}
        height={180}
        className="absolute right-0 top-10 opacity-20 pointer-events-none select-none hidden md:block"
      />
      <Image
        src="/images/Recurso 3@2x.png"
        alt=""
        width={160}
        height={160}
        className="absolute left-10 bottom-0 opacity-20 pointer-events-none select-none hidden md:block"
      />
      <Image
        src="/images/Recurso 4@2x.png"
        alt=""
        width={120}
        height={120}
        className="absolute right-10 bottom-10 opacity-20 pointer-events-none select-none hidden md:block"
      />
      <Image
        src="/images/Recurso 5@2x.png"
        alt=""
        width={100}
        height={100}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none hidden md:block"
      />
      <Image
        src="/images/Recurso 6@2x.png"
        alt=""
        width={80}
        height={80}
        className="absolute right-1/3 top-1/3 opacity-10 pointer-events-none select-none hidden md:block"
      />

      <main className="flex-1 flex flex-col justify-center items-center container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/80 p-4 rounded-2xl shadow-lg flex items-center justify-center">
              <Image
                src="/images/Logo.png"
                alt="Logo Super de Alimentos"
                width={80}
                height={80}
                priority
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-primary drop-shadow-lg">
            Sistema de Selección
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aplica a nuestras vacantes y participa en procesos de selección profesional y confidencial.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Link
            href="/aplicar"
            className="px-8 py-4 rounded-xl bg-primary text-white text-lg font-semibold shadow-lg hover:bg-primary/90 transition"
          >
            Aplicar a una vacante
          </Link>
          
          <div className="text-muted-foreground">o</div>
          
          <Link
            href="/candidato/acceso"
            className="px-8 py-4 rounded-xl border-2 border-primary text-primary text-lg font-semibold hover:bg-primary/5 transition"
          >
            Ingresar con mi token
          </Link>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          Tu información será tratada de manera confidencial y segura.
        </div>
      </main>
      <Footer />
    </div>
  )
}
