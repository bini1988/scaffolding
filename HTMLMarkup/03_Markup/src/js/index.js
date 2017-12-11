import 'jquery';
import hello from './module';

console.log("HTML Scaffolding");
console.log(hello("Stranger"));

$("body")
  .animate({opacity: 0.5}, 500)
  .animate({opacity: 1.0}, 500);
