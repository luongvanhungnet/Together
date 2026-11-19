const FOOD_PAIRS=[
 {food:'Carrot',animal:'Rabbit',color:'orange',foodIcon:'carrot',animalIcon:'rabbit'},
 {food:'Banana',animal:'Monkey',color:'yellow',foodIcon:'banana',animalIcon:'monkey'},
 {food:'Bone',animal:'Dog',color:'white',foodIcon:'bone',animalIcon:'dog'},
 {food:'Fish',animal:'Cat',color:'blue',foodIcon:'fish',animalIcon:'cat'}
];
const ANIMAL_SETS = {
  woodland: [
    {food:'Honey', animal:'Bear', color:'orange', foodIcon:'🍯', animalIcon:'🐻'},
    {food:'Chestnut', animal:'Squirrel', color:'yellow', foodIcon:'🌰', animalIcon:'🐿️'},
    {food:'Apple', animal:'Deer', color:'red', foodIcon:'🍎', animalIcon:'🦌'},
    {food:'Mouse', animal:'Owl', color:'blue', foodIcon:'🐭', animalIcon:'🦉'}
  ],
  barnyard: [
    {food:'Corn', animal:'Chicken', color:'yellow', foodIcon:'🌽', animalIcon:'🐔'},
    {food:'Grass', animal:'Cow', color:'green', foodIcon:'🌿', animalIcon:'🐮'},
    {food:'Apple', animal:'Horse', color:'red', foodIcon:'🍏', animalIcon:'🐴'},
    {food:'Pumpkin', animal:'Pig', color:'orange', foodIcon:'🎃', animalIcon:'🐷'}
  ],
  tropical: [
    {food:'Bamboo', animal:'Panda', color:'green', foodIcon:'🎋', animalIcon:'🐼'},
    {food:'Banana', animal:'Gorilla', color:'yellow', foodIcon:'🍌', animalIcon:'🦍'},
    {food:'Peanuts', animal:'Elephant', color:'orange', foodIcon:'🥜', animalIcon:'🐘'},
    {food:'Mango', animal:'Parrot', color:'red', foodIcon:'🥭', animalIcon:'🦜'}
  ]
};

function pairsFor(count){
  if(wallet.pieces==='geometry')return GEOMETRY_PAIRS.slice(0,count);
  if(ANIMAL_SETS[wallet.pieces])return ANIMAL_SETS[wallet.pieces].slice(0,count);
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
  if(style==='geometry'){
    const shapes={ '●':'circle','◯':'circle','◆':'diamond','◇':'diamond',
      '■':'square','□':'square','▲':'triangle','△':'triangle' };
    const outline='◯◇□△'.includes(icon);
    return '<span class="food-art geometry-art" aria-hidden="true"><span class="geometry-shape '+
      shapes[icon]+(outline?' outline':'')+'"></span></span>';
  }
  const symbol=style==='emoji'?PIECE_EMOJI[icon]:icon;
  return '<span class="food-art piece-symbol" aria-hidden="true">'+symbol+'</span>';
}
