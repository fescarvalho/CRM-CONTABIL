import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CloudAbreu',
    short_name: 'CloudAbreu',
    description: 'Gestão Contábil e Armazenamento em Nuvem',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon512.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any'
      },
      {
        src: '/icon512.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable'
      }
    ]
  }
}
