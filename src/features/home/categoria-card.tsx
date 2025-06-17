import { Categoria } from '@/components/layout/types'
import { CardBody, CardContainer, CardItem } from "@/components/3d-card";
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CategoriaCard({ categoria }: { categoria: Categoria }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Card key={categoria.name} className="flex flex-col items-center  hover:scale-105 transition-all duration-300 bg-gradient-to-b from-white to-zinc-200">
        <CardContent className="flex flex-col items-center">
          <img src={categoria.icon} alt={categoria.name} className="size-24 mb-4" />
          <span className="font-semibold text-base text-center">{categoria.name}</span>
        </CardContent>
      </Card>

    )
  }

  return (

    <CardContainer className="inter-var">
      <CardBody className="bg-card dark:bg-zinc-200 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]  dark:border-white/[0.2] border-black/[0.1]  w-[16rem] h-auto rounded-xl p-6 border  ">
        <CardItem
          translateZ="80"
          rotateX={20}
          rotateZ={-10}
          className="w-full "
        >
          <img
            src={categoria.icon}
            height="500"
            width="500"
            className="h-44 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />

        </CardItem>
        <Button
          className='w-full mt-10 py-6 rounded-xl bg-black text-white '

        >
          {categoria.name}
        </Button>
      </CardBody>
    </CardContainer>
  )
}
