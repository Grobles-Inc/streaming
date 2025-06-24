import { useEffect } from 'react'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { useTheme } from '@/context/theme-context'
import { Button } from '@/components/ui/button'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      className='scale-95 rounded-full'
      onClick={toggleTheme}
    >
      <IconSun className='size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
      <IconMoon className='absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  )
}
