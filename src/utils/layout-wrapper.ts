/**
 * Layout wrapper utility for dynamic layout loading and prop management
 * Provides helper functions for integrating with consuming project layouts
 */

export interface LayoutWrapperConfig {
  enabled: boolean;
  wrapper?: string;
  props?: Record<string, unknown>;
}

export interface LayoutProps {
  title: string;
  description: string;
  [key: string]: unknown;
}

/**
 * Safely loads a layout component from the provided path
 * Returns null if the layout cannot be loaded
 */
export async function loadLayoutComponent(
  layoutPath: string | null
): Promise<unknown> {
  if (!layoutPath) {
    return null;
  }

  try {
    const layoutModule = await import(layoutPath);
    return layoutModule.default || layoutModule;
  } catch (error) {
    console.warn(
      `[astro-photostream] Failed to load layout component: ${layoutPath}`,
      error
    );
    return null;
  }
}

/**
 * Merges layout configuration props with page-specific props
 * Page props take precedence over configuration props
 */
export function mergeLayoutProps(
  configProps: Record<string, unknown> = {},
  pageProps: LayoutProps
): LayoutProps {
  return {
    ...configProps,
    ...pageProps,
  };
}

/**
 * Validates that required layout props are present
 */
export function validateLayoutProps(props: unknown): props is LayoutProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    typeof props.title === 'string' &&
    typeof props.description === 'string'
  );
}

/**
 * Creates a safe layout wrapper that handles loading errors gracefully
 * Returns an object with the layout component and merged props
 */
export async function createLayoutWrapper(
  config: LayoutWrapperConfig,
  pageProps: LayoutProps
): Promise<{
  LayoutComponent: unknown;
  layoutProps: LayoutProps;
  shouldUseLayout: boolean;
}> {
  const shouldUseLayout = config.enabled && Boolean(config.wrapper);

  if (!shouldUseLayout) {
    return {
      LayoutComponent: null,
      layoutProps: pageProps,
      shouldUseLayout: false,
    };
  }

  const LayoutComponent = await loadLayoutComponent(config.wrapper || null);
  const layoutProps = mergeLayoutProps(config.props || {}, pageProps);

  // Validate props
  if (!validateLayoutProps(layoutProps)) {
    console.warn('[astro-photostream] Invalid layout props provided');
    return {
      LayoutComponent: null,
      layoutProps: pageProps,
      shouldUseLayout: false,
    };
  }

  return {
    LayoutComponent,
    layoutProps,
    shouldUseLayout: Boolean(LayoutComponent),
  };
}

/**
 * Helper function to generate consistent page metadata for photo routes
 */
export function createPhotoPageMeta(
  title: string,
  description: string,
  siteName?: string
): LayoutProps {
  const fullTitle = siteName ? `${title} - ${siteName}` : title;

  return {
    title: fullTitle,
    description,
  };
}

/**
 * Helper function to generate metadata for paginated photo routes
 */
export function createPaginatedPageMeta(
  baseTitle: string,
  currentPage: number,
  totalPages: number,
  totalItems: number,
  siteName?: string
): LayoutProps {
  const isFirstPage = currentPage === 1;
  const title = isFirstPage ? baseTitle : `${baseTitle} - Page ${currentPage}`;

  const description = isFirstPage
    ? `Browse ${totalItems} photographs`
    : `Page ${currentPage} of ${totalPages} • ${totalItems} total photos`;

  return createPhotoPageMeta(title, description, siteName);
}

/**
 * Helper function to generate metadata for tag-based photo routes
 */
export function createTagPageMeta(
  tag: string,
  currentPage: number,
  totalPages: number,
  totalItems: number,
  siteName?: string
): LayoutProps {
  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
  const isFirstPage = currentPage === 1;

  const title = isFirstPage
    ? `"${capitalizedTag}" Photos`
    : `"${capitalizedTag}" Photos - Page ${currentPage}`;

  const description = isFirstPage
    ? `Browse ${totalItems} photograph${totalItems !== 1 ? 's' : ''} tagged with "${tag}"`
    : `"${capitalizedTag}" photos - page ${currentPage} of ${totalPages}`;

  return createPhotoPageMeta(title, description, siteName);
}
