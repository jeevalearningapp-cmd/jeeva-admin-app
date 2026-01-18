``# Jeeva Admin Portal – Theme and Branding Guide (`theme.md`)``

`---`

`## 🎨 Color Palette`

`| Token      | Value       | Usage                             |`

`|------------|-------------|-----------------------------------|`

`| Primary    | #1976D2     | Main buttons, links, logo, accent |`

`| Secondary  | #181C32     | App bar, text, labels             |`

`| Background | #FFFFFF     | Cards, modals, panels             |`

`| Surface    | #F5F5F5     | App background                    |`

`| Divider    | #C1C7D0     | Table/grid lines, disabled        |`

`| Body Text  | #545454     | General text, secondary elements  |`

`| Success    | #4CAF50     | Success toasts, confirmed         |`

`| Error      | #D32F2F     | Errors, validation                |`

`| Warning    | #F9A825     | Warnings, cautions                |`

`| Info       | #0288D1     | Informational/status              |`

`---`

`## 🅰️ Typography`

`| Type      | CSS Value (MUI)                   | Usage                  |`

`|-----------|-----------------------------------|------------------------|`

`| Font      | "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif | All text           |`

`| Weight    | 400 (normal), 500, 700 (bold)     | Body, headings, button |`

`| Heading   | 2rem (h1)                         | Main titles            |`

`| Body      | 1rem (default)                    | Tables, descriptions   |`

`| Button    | 1rem bold, no transform           | CTA                    |`

`---`

`## 🖼️ Component Styles`

`- **Button:** MUI contained, border-radius 8px, solid blue, bold white text`

`- **Input:** Rounded 8px, blue focus border, clear/white field`

`- **Card/Modal:** White background, subtle shadow, 24px padding`

``- **Toasts/Alerts:** Use `notistack` for consistent feedback, status color (success/error/info/warning)``

`- **Sidebar:** Vertical, collapsible, accent by role; icon+text`

`- **Navbar:** App logo/title left, profile+search+notifications right`

`---`

`## ⚙️ Theme Setup Sample (MUI)`

// src/theme/theme.js  
import { createTheme } from '@mui/material/styles';

const theme \= createTheme({  
palette: {  
primary: { main: '\#1976D2' },  
secondary: { main: '\#181C32' },  
background: { default: '\#F5F5F5', paper: '\#FFFFFF' },  
success: { main: '\#4CAF50' },  
error: { main: '\#D32F2F' },  
warning: { main: '\#F9A825' },  
info: { main: '\#0288D1' },  
divider: '\#C1C7D0',  
text: {  
primary: '\#181C32',  
secondary: '\#545454',  
disabled: '\#C1C7D0'  
}  
},  
typography: {  
fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',  
fontWeightRegular: 400,  
fontWeightBold: 700,  
button: {  
fontWeight: 700,  
letterSpacing: 0.5,  
textTransform: 'none'  
}  
},  
shape: { borderRadius: 8 }  
});

export default theme;

text

`---`

`## 🧰 Usage in App`

``- Import theme and wrap with MUI ThemeProvider in `src/App.js`:``

import { ThemeProvider } from '@mui/material/styles';  
import theme from './theme/theme';

\<ThemeProvider theme={theme}\> {/\* app/components \*/} \</ThemeProvider\> \`\`\` \- Never mutate theme file structure or import path—only edit values/colors here as brand changes. \- Always use MUI’s built-in components and theme variables to ensure consistent rendering on Replit and in local dev.
