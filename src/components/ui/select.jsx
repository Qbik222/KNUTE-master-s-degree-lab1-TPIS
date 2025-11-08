import * as React from "react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext()

const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false)
  const [labels, setLabels] = React.useState({})
  
  const registerLabel = React.useCallback((val, label) => {
    setLabels(prev => ({ ...prev, [val]: label }))
  }, [])
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, labels, registerLabel }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      ref={ref}
      data-select-trigger
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }) => {
  const { value, labels } = React.useContext(SelectContext)
  const label = value && labels[value] ? labels[value] : (placeholder || "Select...")
  
  return <span>{label}</span>
}

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, onValueChange } = React.useContext(SelectContext)
  const contentRef = React.useRef(null)
  
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        const trigger = event.target.closest('[data-select-trigger]')
        if (!trigger) {
          setOpen(false)
        }
      }
    }
    if (open) {
      setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])
  
  if (!open) return null
  
  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md mt-1",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect: (value) => {
                onValueChange(value)
                setOpen(false)
              }
            })
          }
          return child
        })}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, onSelect, ...props }, ref) => {
  const { value: selectedValue, registerLabel } = React.useContext(SelectContext)
  const isSelected = selectedValue === value
  const itemRef = React.useRef(null)
  
  React.useEffect(() => {
    if (itemRef.current && registerLabel) {
      const text = itemRef.current.textContent || String(children)
      registerLabel(value, text)
    }
  }, [value, children, registerLabel])
  
  return (
    <div
      ref={(node) => {
        itemRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      data-value={value}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-slate-100",
        className
      )}
      onClick={() => onSelect?.(value)}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
