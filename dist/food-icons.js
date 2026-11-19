const FOOD_PAIRS=[
 {food:'Carrot',animal:'Rabbit',color:'orange',foodIcon:'carrot',animalIcon:'rabbit'},
 {food:'Banana',animal:'Monkey',color:'yellow',foodIcon:'banana',animalIcon:'monkey'},
 {food:'Bone',animal:'Dog',color:'white',foodIcon:'bone',animalIcon:'dog'},
 {food:'Fish',animal:'Cat',color:'blue',foodIcon:'fish',animalIcon:'cat'}
];
function pairsFor(count){
  if(wallet.pieces==='geometry')return GEOMETRY_PAIRS.slice(0,count);
  if(count===3)return [FOOD_PAIRS[0],FOOD_PAIRS[1],FOOD_PAIRS[3]];
  return FOOD_PAIRS.slice(0,count);
}
function pairAt(i){return pairsFor(game().start.length)[i]}
// Locally hosted Twemoji artwork, CC BY 4.0. Attribution is shown in the game.
function foodIcon(name){return `<img src="assets/animals/${name}.svg" class="food-art" alt="" aria-hidden="true" draggable="false" width="64" height="64">`}

const GEOMETRY_PAIRS = [
 {food:'Circle',animal:'Circle ring',color:'red',foodIcon:'●',animalIcon:'◯'},
 {food:'Diamond',animal:'Diamond ring',color:'blue',foodIcon:'◆',animalIcon:'◇'},
 {food:'Square',animal:'Square ring',color:'yellow',foodIcon:'■',animalIcon:'□'},
 {food:'Triangle',animal:'Triangle ring',color:'white',foodIcon:'▲',animalIcon:'△'}
];
const PIECE_EMOJI={carrot:'🥕',banana:'🍌',bone:'🦴',fish:'🐟',rabbit:'🐰',monkey:'🐵',dog:'🐶',cat:'🐱'};

function pieceArt(icon, style=wallet.pieces){
  if(style==='farm')return foodIcon(icon);
  const symbol=style==='emoji'?PIECE_EMOJI[icon]:icon;
  return '<span class="food-art piece-symbol" aria-hidden="true">'+symbol+'</span>';
}
