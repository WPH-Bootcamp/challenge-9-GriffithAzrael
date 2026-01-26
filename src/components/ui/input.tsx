import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input">

function Input({
  className,
  type,
  placeholder,
  ...props
}: InputProps) {
  // Untuk input file, tetap gunakan style biasa (tanpa floating label)
  if (type === "file") {
    return (
      <input
        type={type}
        placeholder={placeholder}
        data-slot="input"
        className={cn(
          "h-12 w-full min-w-0 rounded-xl border border-[#D5D7DA]",
          "px-3 py-2 text-sm md:text-base text-neutral-900 placeholder:text-neutral-400",
          "outline-none shadow-none transition-colors",
          "md:h-14",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:px-3 file:text-sm file:font-medium",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus:border-[#C12116]",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div className="relative flex items-center w-full">
      <input
        type={type}
        data-slot="input"
        // Placeholder asli disembunyikan, kita pakai label custom
        placeholder=" "
        className={cn(
          "peer h-12 w-full min-w-0 rounded-xl border border-[#D5D7DA]",
          // padding atas agak besar supaya ada ruang label kecil
          "px-3 pt-4 pb-1 text-sm md:text-base text-neutral-900 placeholder:text-transparent",
          "outline-none shadow-none transition-colors",
          "md:h-14",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus:border-[#C12116]",
          className
        )}
        {...props}
      />

      {placeholder && (
        <span
          className={cn(
            "pointer-events-none absolute left-3 flex items-center text-neutral-400 transition-all duration-150",
            // State MELAYANG (default): kecil & di atas
            "top-1 text-[11px]",
            // State BESAR (placeholder terlihat & belum fokus):
            // - teks 14px mobile, 16px desktop
            // - di tengah secara vertikal
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2",
            "peer-placeholder-shown:text-sm md:peer-placeholder-shown:text-base",
            // Saat FOCUS: selalu kembali ke posisi melayang kecil
            "peer-focus:top-1 peer-focus:translate-y-0",
            "peer-focus:text-[11px] md:peer-focus:text-[11px]"
          )}
        >
          {placeholder}
        </span>
      )}
    </div>
  )
}

export { Input }