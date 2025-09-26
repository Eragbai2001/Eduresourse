// This removes errors like: "Cannot find module or type declarations for side-effect import of './globals.css'"

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

// For CSS Modules
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}

export {};
