/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
  readonly VITE_NODE_URL: string
  readonly VITE_NETWORK_TYPE: string
  /** Optional Alphscan API base URL for normalized events (default: https://api.alphscan.io) */
  readonly VITE_ALPHSCAN_API_URL?: string
  /** Alphscan API key for normalized events (required by API) */
  readonly VITE_ALPHSCAN_API_KEY?: string
  /** Alphscan API stage (e.g. dev, prod) – used in URL path */
  readonly VITE_ALPHSCAN_API_STAGE?: string
  /**
   * Public explorer web app base URL for links in normalized events (tx/address paths).
   * Not VITE_BACKEND_URL (that is the Explorer API). Example: http://localhost:5173
   */
  readonly VITE_ALPHSCAN_EXPLORER_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
