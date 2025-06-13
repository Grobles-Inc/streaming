import { Service } from '@/components/layout/types'
import { Card, CardContent } from '@/components/ui/card'

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Card key={service.name} className="flex flex-col items-center py-8 hover:scale-105 transition-all duration-300">
      <CardContent className="flex flex-col items-center">
        <span className="md:text-5xl text-3xl mb-4">{service.icon}</span>
        <span className="font-semibold text-base text-center">{service.name}</span>
      </CardContent>
    </Card>
  )
}
