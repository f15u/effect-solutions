"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useTonePlayer } from "@/lib/useTonePlayer";
import { springs } from "@/lib/animations";

interface CodeCopyButtonProps {
  value: string;
  className?: string;
}

export function CodeCopyButton({ value, className }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [copyWidth, setCopyWidth] = useState(0);
  const [copiedWidth, setCopiedWidth] = useState(0);
  const [shouldAnimateWidth, setShouldAnimateWidth] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const { playTone } = useTonePlayer();

  // Measure width when content is rendered
  const measureContent = () => {
    if (contentRef.current) {
      const width = contentRef.current.scrollWidth + 24; // Add padding (px-3 = 12px * 2)
      if (copied) {
        setCopiedWidth(width);
      } else {
        setCopyWidth(width);
      }
    }
  };

  useEffect(() => {
    measureContent();
  }, [copied]);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const parent = button.closest(".group");
    if (!parent) return;

    const handleMouseEnter = () => {
      setIsVisible(true);
      setShouldAnimateWidth(false); // Instant on hover
      if (!hovered) {
        playTone({ frequency: 520, duration: 0.06, volume: 0.035 });
        setHovered(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setHovered(false);
    };

    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hovered, playTone]);

  useEffect(() => {
    if (isVisible) {
      // Animate width when copied state changes (on click)
      setShouldAnimateWidth(true);
      // Reset animation flag after spring animation completes
      const timer = setTimeout(() => setShouldAnimateWidth(false), 600);
      return () => clearTimeout(timer);
    }
  }, [copied, isVisible]);

  async function handleCopy(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();

    const text = value.trim();

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      playTone({ frequency: 780, duration: 0.1, volume: 0.05 });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code", error);
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className={cn(
        "pointer-events-auto absolute top-3 right-3 flex items-center border border-neutral-700/80 bg-neutral-950/80 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-neutral-400 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 hover:text-white hover:border-neutral-500",
        copied && "text-emerald-300 border-emerald-400/70",
        className,
      )}
      aria-label="Copy code snippet"
      onClick={handleCopy}
      initial={{ opacity: 0, width: copyWidth || 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        width: isVisible ? (copied ? copiedWidth : copyWidth) : copyWidth,
      }}
      transition={{
        opacity: { duration: 0 },
        width: shouldAnimateWidth ? springs.nodeWidth : { duration: 0 },
      }}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          ref={(el) => {
            contentRef.current = el;
            if (el) {
              // Measure after render
              setTimeout(() => measureContent(), 0);
            }
          }}
          key={copied ? "copied" : "copy"}
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="flex items-center gap-1.5 whitespace-nowrap"
        >
          {copied ? (
            <Check size={14} weight="bold" />
          ) : (
            <Copy size={14} weight="bold" />
          )}
          <span aria-live="polite">{copied ? "COPIED" : "COPY"}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
