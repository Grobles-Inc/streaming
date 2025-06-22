import { CardBody, CardContainer, CardItem } from "@/components/3d-card";
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Categoria } from '../services';

export default function CategoriaCard({ categoria }: { categoria: Categoria }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-all duration-500">
        <Card className="flex flex-col items-center relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-pink-50/20 dark:from-purple-900/20 dark:to-pink-900/20" />
          <CardContent className="flex flex-col items-center relative z-10 p-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-30 animate-pulse" />
              <img
                src={categoria.imagen_url || ''}
                alt={categoria.nombre}
                className="size-24 relative z-10 rounded-full shadow-xl ring-4 ring-white/50 dark:ring-zinc-700/50"
              />
            </div>
            <span className="font-bold text-lg text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {categoria.nombre}
            </span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative px-[3px] rounded-2xl shadow-xl dark:shadow-white/20 shadow-black/20  bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-700 group">
      <CardContainer className="inter-var">
        <CardBody className="bg-white  relative group/card rounded-2xl shadow-2xl hover:shadow-purple-500/30 border-0 w-[16rem] h-auto p-6 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30  rounded-2xl" />

          <CardItem
            translateZ="100"
            rotateX={20}
            rotateZ={-10}
            className="w-full relative z-10"
          >
            <div className="relative overflow-hidden rounded-xl">
              <div className="absolute inset-0  z-10" />
              <img
                src={categoria.imagen_url || ''}
                height="500"
                width="500"
                className="h-44 w-full object-cover group-hover/card:scale-110 transition-transform duration-700 shadow-2xl"
                alt="thumbnail"
              />
            </div>
          </CardItem>

          <CardItem translateZ="60" className="mt-6">
            <Button className="w-full py-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 font-bold text-lg border-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">{categoria.nombre}</span>
            </Button>
          </CardItem>
        </CardBody>
      </CardContainer>
    </div>
  )
}
