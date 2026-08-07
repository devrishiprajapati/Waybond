export type CommunityGallery = {
  slug: string
  destination: string
  label: string
  images: Array<{ src: string; alt: string }>
}

export const communityGalleries: CommunityGallery[] = [
  {
    slug: 'spiti-valley',
    destination: 'Spiti Valley',
    label: 'Himalayan Roads',
    images: [
      { src: '/assets/spiti.jpg', alt: 'Spiti Valley landscape' },
      { src: '/assets/shimla.jpg', alt: 'Shimla mountain journey' },
      { src: '/assets/manali.jpg', alt: 'Manali travel memories' },
      { src: '/assets/hadimba.jpg', alt: 'Hadimba forest trail' }
    ]
  },
  {
    slug: 'leh-ladakh',
    destination: 'Leh Ladakh',
    label: 'High Altitude Stories',
    images: [
      { src: '/assets/LBK.jpeg', alt: 'Leh Ladakh mountains' },
      { src: '/assets/himal.jpg', alt: 'Himalayan peaks in Ladakh' },
      { src: '/assets/himalayas-bg.jpg', alt: 'Ladakh mountain view' },
      { src: '/assets/bald.jpg', alt: 'Ladakh road journey' }
    ]
  },
  {
    slug: 'kashmir',
    destination: 'Kashmir',
    label: 'Valley Memories',
    images: [
      { src: '/assets/kashmir.jpg', alt: 'Kashmir valley' },
      { src: '/assets/alp.jpg', alt: 'Kashmir alpine landscape' },
      { src: '/assets/tains.jpg', alt: 'Kashmir mountain journey' },
      { src: '/assets/darjeeling.jpg', alt: 'Misty mountain travel memories' }
    ]
  },
  {
    slug: 'meghalaya',
    destination: 'Meghalaya',
    label: 'Cloudland Connections',
    images: [
      { src: '/assets/meghaa.jpg', alt: 'Meghalaya hills' },
      { src: '/assets/megha.jpg', alt: 'Meghalaya landscape' },
      { src: '/assets/tree.jpg', alt: 'Meghalaya living roots' },
      { src: '/assets/goat.jpg', alt: 'Meghalaya trail view' }
    ]
  },
  {
    slug: 'bali',
    destination: 'Bali',
    label: 'Island Escapes',
    images: [
      { src: '/assets/bali.jpg', alt: 'Bali island scenery' },
      { src: '/assets/beaut.jpg', alt: 'Bali travel moment' },
      { src: '/assets/ERELA.jpg', alt: 'Bali escape' },
      { src: '/assets/guillaume-marques-bnMPFPuSCI0-unsplash.jpg', alt: 'Bali coastal view' }
    ]
  },
  {
    slug: 'andaman',
    destination: 'Andaman',
    label: 'Coastal Journeys',
    images: [
      { src: '/assets/andaman.jpg', alt: 'Andaman coast' },
      { src: '/assets/kerelabeach.jpg', alt: 'Tropical beach journey' },
      { src: '/assets/pexels-o-darny-4081281.jpg', alt: 'Andaman sea view' },
      { src: '/assets/neom-STV2s3FYw7Y-unsplash.jpg', alt: 'Island coast' }
    ]
  }
]

export const getCommunityGallery = (slug?: string) => communityGalleries.find((gallery) => gallery.slug === slug)

const STORAGE_KEY = 'waybond_community_galleries'

export const loadCommunityGalleries = async (): Promise<CommunityGallery[]> => {
  try {
    const response = await fetch('/api/community-galleries')
    if (response.ok) {
      const saved = await response.json()
      if (Array.isArray(saved)) return saved
    }
  } catch {
    // Static hosting uses the local gallery copy below.
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const galleries = JSON.parse(saved)
      if (Array.isArray(galleries)) return galleries
    }
  } catch {
    // Fall back to the bundled images.
  }

  return communityGalleries
}

export const saveCommunityGalleries = async (galleries: CommunityGallery[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries))
  try {
    await fetch('/api/community-galleries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(galleries)
    })
  } catch {
    // Local storage remains the fallback for static hosting.
  }
}
