import * as THREE from "./libs/three.module.js";
import { MTLLoader } from "./libs/MTLLoader.js";
import { OBJLoader } from "./libs/OBJLoader.js";
import { GLTFLoader } from "./libs/GLTFLoader.js";

var container;
var camera, scene, renderer;
var M;
var mixer, morphs = []; //глобальные переменные для хранения списка анимаций
var clock = new THREE.Clock();
var treeObj = new THREE.Object3D(), palmaObj;
var parrotMesh, parrotMorphs = [], storkMesh, storkMorphs = [];

init();
animate();

//createYachik3();

function init()
{
   container = document.getElementById( 'container' );

   scene = new THREE.Scene();

   camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000 );
   camera.position.set(75, 75, 75);
   camera.lookAt(new THREE.Vector3( 0, 0.0, 0));

   renderer = new THREE.WebGLRenderer( { antialias: false } );
   renderer.setSize( window.innerWidth, window.innerHeight );
   renderer.setClearColor( 0x00ff00ff, 1);
   container.appendChild( renderer.domElement );

   loadTerrainImg();

   mixer = new THREE.AnimationMixer( scene );

   var spotlight = new THREE.PointLight(0xffffff);
   spotlight.position.set(70, 60, 100);
   scene.add(spotlight);

   // вызов функции загрузки модели (в функции Init)
   for (var i = 0; i < 10; i++)
   {
      if (Math.random() < 0.5)
      {
         loadModel('models/trees/', "Tree.obj", "Tree.mtl");
      }
      else
      {
         loadModel('models/trees/', "Palma 001.obj", "Palma 001.mtl");
      }
   }

   storkMorphs.push(loadAnimatedModel('models/animated/Stork.glb'));
   parrotMorphs.push(loadAnimatedModel('models/animated/Parrot.glb'));

   window.addEventListener( 'resize', onWindowResize, false ); 
}

function onWindowResize()
{
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();

   renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate()
{
   var delta = clock.getDelta();
   mixer.update( delta );

   for(var i = 0; i < morphs.length; i++)
   {
      var morph0 = storkMorphs[i];
      var morph1 = parrotMorphs[i];
   }

   requestAnimationFrame( animate );
   render();
}

function render()
{
   renderer.render( scene, camera );
}

/*
function createYachik3()
{
   var vertices = []; // Объявление массива для хранения вершин
   var faces = []; // Объявление массива для хранения индексов
   var uvs = []; // Массив для хранения текстурных координат

   var geometry = new THREE.BufferGeometry();// Создание структуры для хранения геометрии
   var N = 5;

/*vertices.push(1.0, 0.0, 3.0); // Добавление координат первой вершины в массив вершин
vertices.push(1.0, 3.0, 0.0); // Добавление координат второй вершины в массив вершин
vertices.push(3.0, 0.0, 1.0); // Добавление координат третьей вершины в массив вершин
faces.push(0, 1, 2); // Добавление индексов (порядок соединения вершин) в массив индексов
//Добавление вершин и индексов в геометрию
geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
geometry.setIndex( faces );
var colors = []; // Объявление массива для хранения цветов вершин
colors.push(0.8, 0.0, 0.0); // Добавление цвета для первой вершины (красный)
colors.push(0.0, 0.8, 0.0); // Добавление цвета для второй вершины (зелёный)
colors.push(0.0, 0.0, 0.8); // Добавление цвета для третьей вершины (синий)
//Добавление цветов вершин в геометрию
geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
var triangleMaterial = new THREE.MeshBasicMaterial({
    vertexColors:THREE.VertexColors,
    wireframe: false,
    side:THREE.DoubleSide
   });
   // Создание объекта и установка его в определённую позицию
var triangleMesh = new THREE.Mesh(geometry, triangleMaterial);
triangleMesh.position.set(0.0, 0.0, 0.0);
// Добавление объекта в сцену
scene.add(triangleMesh);

   for (let i = 0; i < N; i++)
   {
      for (let j = 0; j < N; j++)
      {
         vertices.push(i, 0, j);
         uvs.push(i/(N-1), j/(N-1)); // Добавление текстурных координат для левой верхней вершины
      }
   }

   for (let i = 0; i < N - 1; i++)
   {
      for (let j = 0; j < N - 1; j++)
      {
         lin_indx0 = i + j * N;
         lin_indx1 = (i + 1) + j * N;
         lin_indx2 = i + (j + 1) * N;
         lin_indx3 = (i + 1) + (j + 1) * N;

         faces.push(lin_indx0, lin_indx1, lin_indx3);
         faces.push(lin_indx0, lin_indx3, lin_indx2);
      }
   }

   geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
   geometry.setIndex( faces );
   geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

   var tex = new THREE.TextureLoader().load( 'img/yachik3.jpg' );

   var mat = new THREE.MeshBasicMaterial({
       map: tex,
       wireframe: false,
       side: THREE.DoubleSide
   });

   var regularGrid = new THREE.Mesh(geometry, mat);
   regularGrid.position.set(-3.0, 0.0, -5.0);

   scene.add(regularGrid);
}
*/

function loadTerrainImg()
{
   var imagedata;
   var canvas = document.createElement('canvas');
   var context = canvas.getContext('2d');
   var img = new Image();
   
   img.onload = function()
   {
      canvas.width = img.width;
      canvas.height = img.height;
      M = img.height;
      context.drawImage(img, 0, 0)
      imagedata = context.getImageData(0, 0, img.width, img.height);
   
      CreateTerrain(M, imagedata);
   }
   
   img.src = 'img/terrain/lake.jpg'
}

function getPixel( imagedata, x, y ) 
{
   var groundPosition = ( x + imagedata.width * y ) * 4, data = imagedata.data;
   return data[ groundPosition ];;
}

function CreateTerrain(M, imagedata)
{
   var groundVertices = [];
   var groundFaces = [];
   var uvsGround = [];
   var groundGeometry = new THREE.BufferGeometry();

   for (let i = 0; i < M; i++)
   {
      for (let j = 0; j < M; j++)
      {
         var h = getPixel( imagedata, i, j )
         groundVertices.push(i * 0.1, h * 0.01, j * 0.1);
         uvsGround.push(i/(M-1), j/(M-1));
      }
   }

   for (let i = 0; i < M - 1; i++) 
   {
    for (let j = 0; j < M - 1; j++)
      {
         var lin_indx0 = i + j * M;
         var lin_indx1 = (i + 1) + j * M;
         var lin_indx2 = i + (j + 1) * M;
         var lin_indx3 = (i + 1) + (j + 1) * M;
         
         groundFaces.push(lin_indx0, lin_indx1, lin_indx3);
         groundFaces.push(lin_indx0, lin_indx3, lin_indx2);
      }
   }

   groundGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( groundVertices, 3 ) );
   groundGeometry.setIndex( groundFaces );

   groundGeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvsGround, 2 ) );
   
   groundGeometry.computeFaceNormals();
   groundGeometry.computeVertexNormals();

   var groundTex = new THREE.TextureLoader().load( 'img/terrain/landtile.jpg' );

   var groundMat = new THREE.MeshLambertMaterial({
      map:groundTex,
      wireframe: false,
      side:THREE.DoubleSide
   });

   var ground = new THREE.Mesh(groundGeometry, groundMat);
   ground.position.set(0.0, 0.0, 0.0);

   scene.add(ground);
}

// lab 3

function loadModel(path, oname, mname) //где path – путь к папке с моделями
{
   const onProgress = function ( xhr ) { //выполняющаяся в процессе загрузки
      if ( xhr.lengthComputable ) {
         const percentComplete = xhr.loaded / xhr.total * 100;
         console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
      }
   };
   const onError = function () { }; //выполняется в случае возникновения ошибки

   const manager = new THREE.LoadingManager();
   new MTLLoader( manager )
      .setPath( path ) //путь до модели
      .load( mname, function ( materials ) { //название материала
         materials.preload();
         new OBJLoader( manager )
            .setMaterials( materials ) //установка материала
            .setPath( path ) //путь до модели
            .load( oname, function ( object ) { //название модели
               //позиция модели по координате X
               object.position.x = Math.random() * (M - 2) * 0.1;
               //object.position.y = 10;
               object.position.z = Math.random() * (M - 2) * 0.1;
               //масштаб модели
               object.scale.set(0.05, 0.05, 0.05);
               //object.scale.set(0.02, 0.02, 0.02);
               //добавление модели в сцену
               scene.add( object );
            }, onProgress, onError );
      } );
}

function loadAnimatedModel(path) //где path – путь и название модели
{
   var loader = new GLTFLoader();

   loader.load( path, function ( gltf ) {
      var mesh = gltf.scene.children[ 0 ];
      var clip = gltf.animations[ 0 ];
      //установка параметров анимации (скорость воспроизведения и стартовый фрейм)
      mixer.clipAction( clip, mesh ).setDuration( 1 ).startAt( 0 ).play();
 
      mesh.position.set(10, 10, 20); //установка позиции объекта
      mesh.rotation.y = Math.PI / 8; //поворот модели вокруг оси Y
      mesh.scale.set(0.05, 0.05, 0.05); //масштаб модели

   scene.add( mesh ); //добавление модели в сцену
   //morphs.push( mesh );
   } );
}