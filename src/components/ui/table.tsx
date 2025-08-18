import * as React from 'react'
import { cn } from '@/lib/utils'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  const tableRef = React.useRef<HTMLTableElement>(null)
  const stickyScrollbarRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const table = tableRef.current
    const stickyScrollbar = stickyScrollbarRef.current

    if (!table || !stickyScrollbar) return

    // Buscar el contenedor con scroll más cercano (puede ser el div wrapper)
    let scrollContainer = table.parentElement
    while (scrollContainer && scrollContainer !== document.body) {
      const computedStyle = window.getComputedStyle(scrollContainer)
      if (computedStyle.overflowX === 'auto' || computedStyle.overflowX === 'scroll') {
        break
      }
      scrollContainer = scrollContainer.parentElement
    }

    // Si no encuentra un contenedor con scroll, crear uno
    if (!scrollContainer || scrollContainer === document.body) {
      scrollContainer = table.parentElement
      if (scrollContainer) {
        scrollContainer.style.overflowX = 'auto'
        scrollContainer.style.overflowY = 'visible'
      }
    }

    if (!scrollContainer) return

    // Ocultar la barra de scroll original del contenedor
    const originalScrollbarWidth = scrollContainer.style.scrollbarWidth
    const originalMsOverflowStyle = (scrollContainer as any).style.msOverflowStyle
    
    scrollContainer.style.scrollbarWidth = 'none'
    ;(scrollContainer as any).style.msOverflowStyle = 'none'
    scrollContainer.classList.add('hide-scrollbar')

    // Sincronizar el scroll entre el contenedor y la barra fija
    const handleContainerScroll = () => {
      stickyScrollbar.scrollLeft = scrollContainer!.scrollLeft
    }

    const handleStickyScroll = () => {
      scrollContainer!.scrollLeft = stickyScrollbar.scrollLeft
    }

    // Actualizar el ancho de la barra de scroll fija
    const updateScrollbarWidth = () => {
      if (scrollContainer && table) {
        // Obtener el ancho del contenedor visible
        const containerRect = scrollContainer.getBoundingClientRect()
        stickyScrollbar.style.width = `${containerRect.width}px`
        stickyScrollbar.style.left = `${containerRect.left}px`
        
        const scrollContent = stickyScrollbar.querySelector('.scroll-content') as HTMLElement
        if (scrollContent) {
          scrollContent.style.width = `${table.scrollWidth}px`
        }
        
        // Mostrar/ocultar la barra según si hay scroll
        const needsScroll = table.scrollWidth > scrollContainer.clientWidth
        stickyScrollbar.style.display = needsScroll ? 'block' : 'none'
      }
    }

    // Agregar event listeners
    scrollContainer.addEventListener('scroll', handleContainerScroll)
    stickyScrollbar.addEventListener('scroll', handleStickyScroll)

    // Observar cambios en el tamaño
    const resizeObserver = new ResizeObserver(updateScrollbarWidth)
    resizeObserver.observe(scrollContainer)
    resizeObserver.observe(table)

    // Actualizar inicialmente
    setTimeout(updateScrollbarWidth, 0)

    // Cleanup
    return () => {
      scrollContainer?.removeEventListener('scroll', handleContainerScroll)
      stickyScrollbar.removeEventListener('scroll', handleStickyScroll)
      resizeObserver.disconnect()
      
      // Restaurar estilos originales
      if (scrollContainer) {
        scrollContainer.style.scrollbarWidth = originalScrollbarWidth
        ;(scrollContainer as any).style.msOverflowStyle = originalMsOverflowStyle
        scrollContainer.classList.remove('hide-scrollbar')
      }
    }
  }, [])

  React.useEffect(() => {
    // Agregar estilos CSS para barra de scroll fija
    const style = document.createElement('style')
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      
      .sticky-horizontal-scrollbar {
        position: fixed;
        bottom: 0;
        z-index: 1000;
        height: 17px;
        overflow-x: auto;
        overflow-y: hidden;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border-top: 1px solid #e5e7eb;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
        display: none;
      }
      
      .sticky-horizontal-scrollbar::-webkit-scrollbar {
        height: 17px;
      }
      
      .sticky-horizontal-scrollbar::-webkit-scrollbar-track {
        background: #f8f9fa;
        border-radius: 0;
      }
      
      .sticky-horizontal-scrollbar::-webkit-scrollbar-thumb {
        background: #6b7280;
        border-radius: 4px;
        border: 2px solid #f8f9fa;
      }
      
      .sticky-horizontal-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #374151;
      }
      
      .scroll-content {
        height: 1px;
        pointer-events: none;
      }
    `
    
    if (!document.getElementById('table-sticky-scrollbar-styles')) {
      style.id = 'table-sticky-scrollbar-styles'
      document.head.appendChild(style)
    }
    
    return () => {
      const existingStyle = document.getElementById('table-sticky-scrollbar-styles')
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  return (
    <div
      data-slot='table-container'
      className='relative w-full overflow-x-auto'
    >
      <table
        ref={tableRef}
        data-slot='table'
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
      
      {/* Barra de scroll horizontal fija */}
      <div
        ref={stickyScrollbarRef}
        className="sticky-horizontal-scrollbar"
      >
        <div className="scroll-content"></div>
      </div>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot='table-header'
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot='table-body'
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot='table-footer'
      className={cn(
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot='table-row'
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot='table-head'
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot='table-cell'
      className={cn(
        'px-2 py-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot='table-caption'
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
