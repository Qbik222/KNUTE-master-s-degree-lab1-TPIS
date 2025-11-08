import * as React from "react"
import { cn } from "@/lib/utils"

const SheetContext = React.createContext()

const Sheet = ({ open: controlledOpen, onOpenChange, defaultOpen, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  
  const setOpen = React.useCallback((value) => {
    if (!isControlled) {
      setInternalOpen(value)
    }
    if (onOpenChange) {
      onOpenChange(value)
    }
  }, [isControlled, onOpenChange])
  
  return (
    <SheetContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = React.forwardRef(({ asChild, className, children, ...props }, ref) => {
  const { onOpenChange } = React.useContext(SheetContext)
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e)
        onOpenChange(true)
      }
    })
  }
  
  return (
    <button
      ref={ref}
      className={className}
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  )
})
SheetTrigger.displayName = "SheetTrigger"

const SheetContent = React.forwardRef(({ className, children, side = "right", ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(SheetContext)
  const contentRef = React.useRef(null)
  
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onOpenChange])
  
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        onOpenChange(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, onOpenChange])
  
  if (!open) return null
  
  const sideClasses = {
    right: "right-0 top-0 h-full border-l",
    left: "left-0 top-0 h-full border-r",
    top: "top-0 left-0 w-full border-b",
    bottom: "bottom-0 left-0 w-full border-t",
  }
  
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
      <div
        ref={contentRef}
        className={cn(
          "fixed z-50 w-full max-w-sm border bg-background p-6 shadow-lg transition-transform",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle }

