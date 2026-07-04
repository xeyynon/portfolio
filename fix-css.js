const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

css = css.replace(
  `@media(max-width:640px){
  .rail{display:none;}
  header.nav{margin-left:0;}
  .nav-links{display:none;}
}`,
  `@media(max-width:640px){
  .rail{display:none;}
  header.nav{margin-left:0; padding: 12px 0;}
  .nav-links {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .nav-links::-webkit-scrollbar { display: none; }
}`
);

css = css.replace(
  `.leadership-item {
  position: relative;
  display: grid; grid-template-columns: 90px 1fr auto;
  align-items: center; gap: 20px;
  padding: 16px 0;
}`,
  `.leadership-item {
  position: relative;
  display: grid; grid-template-columns: 90px 1fr auto;
  align-items: center; gap: 20px;
  padding: 16px 0;
}
@media(max-width:640px){
  .leadership-item { gap: 8px; grid-template-columns: 70px 1fr auto; }
}`
);

fs.writeFileSync('app/globals.css', css);
