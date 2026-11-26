import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { IconDots } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { UserNav } from '@/components/user-nav'
import { checkIsActive } from './nav-group'
import { type NavLink } from './types'

interface BottomTabsProps {
  tabs: NavLink[]
  more: NavLink[]
}

export function BottomTabs({ tabs, more }: BottomTabsProps) {
  const href = useLocation({ select: (location) => location.href })
  const [openMore, setOpenMore] = useState(false)
  const isMoreActive = more.some((item) => checkIsActive(href, item))

  return (
    <>
      <nav className='bg-background fixed inset-x-0 bottom-0 z-40 flex border-t pb-[env(safe-area-inset-bottom)] md:hidden'>
        {tabs.map((item) => (
          <Link
            key={`${item.title}-${item.url}`}
            to={item.url}
            className={cn(
              'text-muted-foreground flex h-16 flex-1 flex-col items-center justify-center gap-1',
              checkIsActive(href, item) && 'text-primary'
            )}
          >
            {item.icon && <item.icon className='size-5' />}
            <span className='text-[11px] font-medium'>
              {item.shortTitle ?? item.title}
            </span>
          </Link>
        ))}
        <button
          type='button'
          onClick={() => setOpenMore(true)}
          className={cn(
            'text-muted-foreground flex h-16 flex-1 flex-col items-center justify-center gap-1',
            isMoreActive && 'text-primary'
          )}
        >
          <IconDots className='size-5' />
          <span className='text-[11px] font-medium'>Más</span>
        </button>
      </nav>
      <Sheet open={openMore} onOpenChange={setOpenMore}>
        <SheetContent
          side='bottom'
          className='pb-[calc(1rem+env(safe-area-inset-bottom))]'
        >
          <SheetHeader>
            <SheetTitle>Más opciones</SheetTitle>
          </SheetHeader>
          <div className='flex flex-col gap-1 px-2'>
            {more.map((item) => (
              <Link
                key={`${item.title}-${item.url}`}
                to={item.url}
                onClick={() => setOpenMore(false)}
                className={cn(
                  'hover:bg-accent flex items-center gap-3 rounded-md p-3 text-sm',
                  checkIsActive(href, item) && 'bg-accent text-accent-foreground'
                )}
              >
                {item.icon && <item.icon className='size-5' />}
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
          <div className='border-t px-2 pt-2'>
            <UserNav />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
