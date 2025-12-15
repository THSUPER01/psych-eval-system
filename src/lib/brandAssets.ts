export const brandLogos = [
  {
    src: "/images/imagelogo.png",
    alt: "Logo corporativo Super de Alimentos",
  },
  {
    src: "/images/imagelogo1.png",
    alt: "Logo corporativo marca aliada 1",
  },
  {
    src: "/images/imagelogo2.png",
    alt: "Logo corporativo marca aliada 2",
  },
  {
    src: "/images/imagelogo3.png",
    alt: "Logo corporativo marca aliada 3",
  },
] as const

export type BrandLogo = (typeof brandLogos)[number]
