import * as THREE from "./libs/three.module.js";
import { MTLLoader } from "./libs/MTLLoader.js";
import { OBJLoader } from "./libs/OBJLoader.js";
import { GLTFLoader } from "./libs/GLTFLoader.js";

var container;
var camera, scene, renderer;
var keyboard = new THREEx.KeyboardState();
var imagedata;
var M, t = 0, T = 0;
var mixer, morphs = []; //глобальные переменные для хранения списка анимаций
var clock = new THREE.Clock();
var focusOn = 0;
var storkPath, parrotPath;
var ang = 0.0;

init();
animate();

//createYachik3();

function init()
{
   container = document.getElementById( 'container' );

   scene = new THREE.Scene();

   camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000 );
   camera.position.set(70, 70, 70);
   camera.lookAt(new THREE.Vector3( 0, 0, 0));

   renderer = new THREE.WebGLRenderer( { antialias: false } );
   renderer.setSize( window.innerWidth, window.innerHeight );
   renderer.setClearColor( 0x00ff00ff, 1);
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   container.appendChild( renderer.domElement );

   loadTerrainImg();
   scene.add(createSkySphere());

   mixer = new THREE.AnimationMixer( scene );

   //создание точечного источника освещения, параметры: цвет, интенсивность, дальность
   const light = new THREE.SpotLight( 0xffffff);
   light.position.set( -50, 500, -50 ); //позиция источника освещения
   light.castShadow = true; //включение расчёта теней от источника освещения
   light.target = new THREE.Object3D();
   light.target.position.set(0, 0, 0);
   scene.add(light.target);
   //настройка расчёта теней от источника освещения
   light.shadow.mapSize.width = 2048; //ширина карты теней в пикселях
   light.shadow.mapSize.height = 2048; //высота карты теней в пикселях
   light.shadow.camera.near = 0.5; //расстояние, ближе которого не будет теней
   light.shadow.camera.far = 2500; //расстояние, дальше которого не будет теней

   scene.add( light ); //добавление источника освещения в сцену

   loadModel('models/trees/', "Tree.obj", "Tree.mtl");
   loadAnimatedModel('models/animated/Stork.glb');
   loadAnimatedModel('models/animated/Parrot.glb');
   loadAnimatedModel('models/animated/Flamingo.glb');
   //morphs.push(loadAnimatedModel('models/animated/Stork.glb'));
   //parrotMorphs.push(loadAnimatedModel('models/animated/Parrot.glb'));

   storkPath = createTrajectory();
   parrotPath = createTrajectory();

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
   t += delta * 2;
   T = 30;

   for (var i = 0; i < morphs.length - 1; i++)
   {  
      var morph = morphs[i];
      var pos = new THREE.Vector3();

      if (t >= T)
         t = 0.0;
      
         if (i == 0)
            pos.copy(storkPath.getPointAt(t/T));
         else 
            pos.copy(parrotPath.getPointAt(t/T));

      morph.position.copy(pos);

      if (t + 0.01 >= T)
         t = 0.0;

      var nextPoint = new THREE.Vector3();

      if (i == 0)
         nextPoint.copy(storkPath.getPointAt((t + 0.01)/T));
      else
         nextPoint.copy(parrotPath.getPointAt((t + 0.01)/T));

      morph.lookAt(nextPoint);
   }

   if (morphs.length == 3)
   {
      Focus();
      keyboardControll();
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
         
         groundFaces.push(lin_indx0,    lin_indx1, lin_indx3);
         groundFaces.push(lin_indx0, lin_indx3, lin_indx2);
      }
   }

   groundGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( groundVertices, 3 ) );
   groundGeometry.setIndex( groundFaces );

   groundGeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvsGround, 2 ) );
   
   groundGeometry.computeFaceNormals();
   groundGeometry.computeVertexNormals();

   var groundTex = new THREE.TextureLoader().load( 'img/terrain/grasstile.jpg' );

   var groundMat = new THREE.MeshLambertMaterial({
      map:groundTex,
      wireframe: false,
      side:THREE.DoubleSide    
   });

   var ground = new THREE.Mesh(groundGeometry, groundMat);
   ground.position.set(0.0, 0.0, 0.0);

   ground.receiveShadow = true;

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
               
               object.scale.set(0.05, 0.06, 0.05);
               //object.receiveShadow = true;
               object.castShadow = true;

               object.traverse( function ( child )
               {
                  if ( child instanceof THREE.Mesh )
                  {
                     child.castShadow = true;
                  }
               } );
               
               for (var i = 0; i < 10; i++)
               {
                  object.position.x = Math.random() * (M - 2) * 0.1;
                  object.position.z = Math.random() * (M - 2) * 0.1;
                  object.position.y = getPixel(imagedata, Math.round(object.position.x), Math.round(object.position.z)) * 0.01 - 0.1;

                  var clone = object.clone();

                  scene.add( clone );
                  //trees.push(clone);
               }

            }, onProgress, onError     );
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

      mesh.castShadow = true;
      //mesh.receiveShadow = true;

      scene.add( mesh ); //добавление модели в сцену
      morphs.push( mesh );
   } );
}

function createTrajectory()
{
   var rand = Math.random() * (2 - 0.5) + 0.5;
   var curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3( 10 * rand, 15, 25 ), //P0
      new THREE.Vector3( 10 * rand, 15, 40), //P1
      new THREE.Vector3( 23 * rand, 15, 40 ), //P2
      new THREE.Vector3( 23 * rand, 15, 25 ) //P3
     );
   var curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3( 23 * rand, 15, 24 ), //P0
      new THREE.Vector3( 23 * rand, 15, 11 ), //P1
      new THREE.Vector3( 10 * rand, 15, 11 ), //P2
      new THREE.Vector3( 10 * rand, 15, 24 ) //P3
     );

   var vertices = [];
   vertices = curve1.getPoints( 20 );
   vertices = vertices.concat(curve2.getPoints( 20 ));
   
   // создание кривой по списку точек
   var path = new THREE.CatmullRomCurve3(vertices);
   // является ли кривая замкнутой (зацикленной)
   path.closed = true;

   //создание геометрии из точек кривой
   var geometry = new THREE.BufferGeometry().setFromPoints( vertices );
   var material = new THREE.LineBasicMaterial( { color : 0xffff00 } );
   //создание объекта
   var curveObject = new THREE.Line( geometry, material );
   scene.add(curveObject); //добавление объекта в сцену
   
   return path;
}

function createSkySphere()
{   
   var geometry = new THREE.SphereGeometry( 1000, 32, 32 );

   var tex = new THREE.TextureLoader().load( "img/sky/sky_1.jpg" );
   tex.minFilter = THREE.NearestFilter;
   tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

   var material = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.DoubleSide
      });

   var sphere = new THREE.Mesh( geometry, material );
   sphere.rotation.x = 180;

   return sphere;
}

function Focus()
{
   
   if (focusOn == 0)
   {
      camera.position.set(70, 70, 70);
      camera.lookAt(0, 0, 0);
   }
   else if (focusOn == 3)
   {
      var morph = morphs[focusOn - 1];
      var cameraOffset = new THREE.Vector3(0, 3, -35);
      var rotMat = new THREE.Matrix4();
      var posMat = new THREE.Matrix4();
      var Mat = new THREE.Matrix4();

      rotMat.extractRotation(morph.matrixWorld);
      posMat.copyPosition(morph.matrixWorld);
      Mat.multiplyMatrices(posMat, rotMat);

      camera.position.copy(cameraOffset.applyMatrix4(Mat));
      camera.lookAt(morph.position);
   }
   else if (focusOn == 1)
   {
      var morph = morphs[focusOn - 1];
      var cameraOffset = new THREE.Vector3(0, 3, -15);
      var rotMat = new THREE.Matrix4();
      var posMat = new THREE.Matrix4();
      var Mat = new THREE.Matrix4();

      rotMat.extractRotation(morph.matrixWorld);
      posMat.copyPosition(morph.matrixWorld);
      Mat.multiplyMatrices(posMat, rotMat);

      camera.position.copy(cameraOffset.applyMatrix4(Mat));
      camera.lookAt(morph.position);
   }
   else if (focusOn == 2)
   {
      var morph = morphs[focusOn - 1];
      var cameraOffset = new THREE.Vector3(0, 3, -15);
      var rotMat = new THREE.Matrix4();
      var posMat = new THREE.Matrix4();
      var Mat = new THREE.Matrix4();

      rotMat.extractRotation(morph.matrixWorld);
      posMat.copyPosition(morph.matrixWorld);
      Mat.multiplyMatrices(posMat, rotMat);

      camera.position.copy(cameraOffset.applyMatrix4(Mat));
      camera.lookAt(morph.position);
   }
}

function keyboardControll()
{
   if (keyboard.pressed("0"))
      focusOn = 0;
   else if (keyboard.pressed("1"))
      focusOn = 1;
   else if (keyboard.pressed("2"))
      focusOn = 2;
   else if (keyboard.pressed("3"))
      focusOn = 3;

   if (focusOn == 3)
   {
      var morph = morphs[focusOn - 1];
      var rotAxis = new THREE.Vector3(0, 1, 0);
      var tiltAxis = new THREE.Vector3(0, 0, 1);
      //var xAxis = new THREE.Vector3(0, 0, 1);

      

      if (keyboard.pressed("up"))
      {
         morph.translateZ(0.1);
      }
      else if (keyboard.pressed("down"))
      {
         morph.translateZ(-0.1);
      }
      if (keyboard.pressed("left"))
      {
         if (ang > - Math.PI/4)
         {
            ang -= 0.01;
            morph.rotateOnAxis(tiltAxis, -0.01);
         }
            
         morph.rotateOnAxis(tiltAxis, -ang);
         morph.rotateOnAxis(rotAxis, 0.01);
         morph.rotateOnAxis(tiltAxis, ang);
         
      } 
      else if (keyboard.pressed("right"))
      {
         if (ang < Math.PI/4)
         {
            ang += 0.01;
            morph.rotateOnAxis(tiltAxis, 0.01);
         }
            
         morph.rotateOnAxis(tiltAxis, -ang);
         morph.rotateOnAxis(rotAxis, -0.01);
         morph.rotateOnAxis(tiltAxis, ang);
         
      } 
      else
      {
         if (ang > 0)
         {
            ang -= 0.01;
            morph.rotateOnAxis(tiltAxis, -0.01);
         }
         else
         {
            ang += 0.01;
            morph.rotateOnAxis(tiltAxis, 0.01);
         }
      }
   }
}