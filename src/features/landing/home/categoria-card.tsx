
import { Categoria } from '../services';
import { useImageProxy } from '@/hooks/use-image-proxy';
import "../styles/card.css"

export default function CategoriaCard({ categoria }: { categoria: Categoria }) {
  const { getProxiedImageUrl } = useImageProxy();


  return (

    <div className="card-container">
      <svg style={{ position: 'absolute', width: '0', height: '0' }}>
        <filter id="unopaq" y="-100%" height="300%" x="-100%" width="300%">
          <feColorMatrix
            values="1 0 0 0 0 
            0 1 0 0 0 
            0 0 1 0 0 
            0 0 0 5 0"
          ></feColorMatrix>
        </filter>
        <filter id="unopaq2" y="-100%" height="300%" x="-100%" width="300%">
          <feColorMatrix
            values="1 0 0 0 0 
            0 1 0 0 0 
            0 0 1 0 0 
            0 0 0 10 0"
          ></feColorMatrix>
        </filter>
        <filter id="unopaq3" y="-100%" height="300%" x="-100%" width="300%">
          <feColorMatrix
            values="1 0 0 1 0 
            0 1 0 1 0 
            0 0 1 1 0 
            0 0 0 2 0"
          ></feColorMatrix>
        </filter>
      </svg>
      <div className="card-container size-[120px] md:size-48">
        <div className="spin spin-blur"></div>
        <div className="spin spin-intense"></div>
        <div className="card-border">
          <div className="spin spin-inside"></div>
        </div>
        <div className="card bg-card">
          <div className='flex flex-col justify-center items-center h-full gap-2 md:p-4'>
            <img src={getProxiedImageUrl(categoria.imagen_url)} alt={categoria.nombre} className='md:size-28 size-16 mix-blend-multiply dark:mix-blend-normal' />
            <p className='md:text-xl text-[9px] md:font-bold text-center  text-black dark:text-white'>{categoria.nombre}</p>
          </div>
        </div>
      </div>

    </div >
  )
}
