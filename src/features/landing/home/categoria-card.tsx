
import { Categoria } from '../services';
import "../styles/card.css"

export default function CategoriaCard({ categoria }: { categoria: Categoria }) {


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
      <div className="card-container size-[100px] md:size-48">
        <div className="spin spin-blur"></div>
        <div className="spin spin-intense"></div>
        <div className="card-border">
          <div className="spin spin-inside"></div>
        </div>
        <div className="card bg-card">
          <div className='flex flex-col md:justify-center md:items-center gap-2 md:p-4 p-2'>
            <img src={categoria.imagen_url || ''} alt={categoria.nombre} className='md:size-28 size-20 mix-blend-multiply dark:mix-blend-normal' />
            <p className='text-xl font-bold text-center hidden md:block text-black dark:text-white'>{categoria.nombre}</p>
          </div>
        </div>
      </div>

    </div >
  )
}
