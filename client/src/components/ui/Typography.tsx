import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Typography（文字语义组件）
 *
 * 默认颜色全部绑定到 --text-* 语义 token：
 * - primary → --text-title
 * - emphasis → --text-emphasis
 * - body → --text-body
 * - secondary → --text-secondary
 * - muted → --text-muted
 * - weak → --text-weak
 * - brand → --text-brand
 * - danger → --text-danger
 */
export const typographyColorTokens = {
  primary: "text-[var(--text-title)]",
  emphasis: "text-[var(--text-emphasis)]",
  body: "text-[var(--text-body)]",
  secondary: "text-[var(--text-secondary)]",
  muted: "text-[var(--text-muted)]",
  weak: "text-[var(--text-weak)]",
  brand: "text-[var(--text-brand)]",
  danger: "text-[var(--text-danger)]",
  inherit: "text-inherit",
} as const;

export type TypographyColorToken = keyof typeof typographyColorTokens;

type TypographyProps<T extends React.ElementType> = {
  as?: T;
  /** 颜色 token；不传时使用该语义组件的默认 token */
  tone?: TypographyColorToken;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "color">;

type TypographyComponent<DefaultElement extends React.ElementType> = <
  T extends React.ElementType = DefaultElement,
>(
  props: TypographyProps<T> & {
    ref?: React.ComponentPropsWithRef<T>["ref"];
  },
) => React.ReactElement | null;

function createTypography<DefaultElement extends React.ElementType>(
  displayName: string,
  defaultAs: DefaultElement,
  baseClassName: string,
  defaultTone: TypographyColorToken,
): TypographyComponent<DefaultElement> {
  const Component = React.forwardRef<Element, TypographyProps<React.ElementType>>(
    ({ as, tone, className, ...props }, ref) => {
      const Comp = as ?? defaultAs;
      const resolvedTone = (tone ?? defaultTone) as TypographyColorToken;

      return React.createElement(Comp, {
        ...props,
        ref,
        className: cn(baseClassName, typographyColorTokens[resolvedTone], className),
      });
    },
  );

  Component.displayName = displayName;

  return Component as TypographyComponent<DefaultElement>;
}

export const TenantHeroTitle = createTypography(
  "TenantHeroTitle",
  "h1",
  "font-sans text-[26px] font-medium leading-[35.56px] tracking-[-0.0427em]",
  "primary",
);

export const TenantPageTitle = createTypography(
  "TenantPageTitle",
  "h1",
  "font-sans text-2xl font-medium leading-[1.4]",
  "primary",
);

export const TenantDocTitle = createTypography(
  "TenantDocTitle",
  "h1",
  "font-sans text-xl font-semibold leading-[1.4]",
  "primary",
);

export const SectionTitle = createTypography(
  "SectionTitle",
  "h2",
  "font-sans text-lg font-medium leading-[1.4]",
  "primary",
);

export const PanelTitle = createTypography(
  "PanelTitle",
  "h2",
  "font-sans text-base font-semibold leading-[1.4]",
  "primary",
);

export const CardTitle = createTypography(
  "CardTitle",
  "h3",
  "font-sans text-sm font-medium leading-[1.5]",
  "primary",
);

export const BodyText = createTypography(
  "BodyText",
  "p",
  "font-sans text-sm font-normal leading-[1.5]",
  "body",
);

export const BodyMedium = createTypography(
  "BodyMedium",
  "span",
  "font-sans text-sm font-medium leading-[1.5]",
  "emphasis",
);

export const CompactText = createTypography(
  "CompactText",
  "span",
  "font-sans text-[13px] font-normal leading-[1.5]",
  "secondary",
);

export const MiniBodyText = createTypography(
  "MiniBodyText",
  "span",
  "font-sans text-xs font-normal leading-[1.5]",
  "body",
);

export const MetaText = createTypography(
  "MetaText",
  "span",
  "font-sans text-xs font-normal leading-[1.5]",
  "muted",
);

export const MetaMedium = createTypography(
  "MetaMedium",
  "span",
  "font-sans text-xs font-medium leading-[1.5]",
  "muted",
);

export const SmallBodyText = createTypography(
  "SmallBodyText",
  "span",
  "font-sans text-xs font-normal leading-3 tracking-[0.18px]",
  "emphasis",
);

export const TinyText = createTypography(
  "TinyText",
  "span",
  "font-en text-[10px] font-semibold leading-none tracking-[0.02em]",
  "brand",
);

export const StatNumber = createTypography(
  "StatNumber",
  "span",
  "font-din-stat text-2xl font-semibold leading-none tabular-nums",
  "emphasis",
);

export const InlineNumber = createTypography(
  "InlineNumber",
  "span",
  "font-din text-sm leading-[1.5] tabular-nums",
  "body",
);

export const CodeText = createTypography(
  "CodeText",
  "code",
  "font-mono text-xs leading-[1.5]",
  "secondary",
);

export const StepText = createTypography(
  "StepText",
  "span",
  "font-mono text-sm font-medium leading-none",
  "brand",
);

export const UrlText = createTypography(
  "UrlText",
  "span",
  "font-sans text-sm font-normal leading-[1.5] break-all",
  "emphasis",
);
