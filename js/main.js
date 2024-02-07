var container;

var camera, scene, renderer;

init();

animate();

function init()
{
    // Получение ссылки на элемент html страницы
    container = document.getElementById( 'container' );
   // Создание "сцены"
    scene = new THREE.Scene();
 // Установка параметров камеры
 // 45 - угол обзора
 // window.innerWidth / window.innerHeight - соотношение сторон
 // 1 - 4000 - ближняя и дальняя плоскости отсечения
    camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 1, 4000 );
 // Установка позиции камеры
    camera.position.set(6, 6, 6);

 // Установка точки, на которую камера будет смотреть
    camera.lookAt(new THREE.Vector3( 0, 0.0, 0));
 // Создание отрисовщика
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
 // Закрашивание экрана синим цветом, заданным в 16ричной системе
    renderer.setClearColor( 0x00ff00ff, 1);
    container.appendChild( renderer.domElement );
 // Добавление функции обработки события изменения размеров окна
    window.addEventListener( 'resize', onWindowResize, false ); 
}

function onWindowResize()
{
 // Изменение соотношения сторон для виртуальной камеры
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
 // Изменение соотношения сторон рендера
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate()
{
 // Добавление функции на вызов, при перерисовки браузером страницы
    requestAnimationFrame( animate );
    render();
}

function render()
{
    // Рисование кадра
    renderer.render( scene, camera );
}

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
scene.add(triangleMesh);*/

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



//Добавление текстурных координат в геометрию
geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

var tex = new THREE.TextureLoader().load( 'img/yachik3.jpg' );

var mat = new THREE.MeshBasicMaterial({
    // Источник цвета - текстура
    map: tex,
    wireframe: false,
    side: THREE.DoubleSide
   });

/*var mat = new THREE.MeshBasicMaterial({
   vertexColors:THREE.VertexColors,
   wireframe: true,
   side:THREE.DoubleSide
  });
*/

var regularGrid = new THREE.Mesh(geometry, mat);
regularGrid.position.set(-3.0, 0.0, -5.0);

scene.add(regularGrid);


// 4
var imagedata;
var groundVertices = [];
var groundFaces = [];
var uvsGround = [];
var groundGeometry = new THREE.BufferGeometry();
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var img = new Image();
var M;

img.onload = function()
{
   canvas.width = img.width;
   canvas.height = img.height;
   M = img.height;
   context.drawImage(img, 0, 0)
   imagedata = context.getImageData(0, 0, img.width, img.height);

   CreateTerrain();
}

img.src = 'img/lake.jpg'

function getPixel( imagedata, x, y ) 
{
   var groundPosition = ( x + imagedata.width * y ) * 4, data = imagedata.data;
   return data[ groundPosition ];;
}

var spotlight = new THREE.PointLight(0xffffff);
//установка позиции источника освещения
spotlight.position.set(70, 60, 100);
//добавление источника в сцену
scene.add(spotlight);

function CreateTerrain()
{
   //var M = 256

   for (let i = 0; i < M; i++)
   {
      for (let j = 0; j < M; j++)
      {
         var h = getPixel( imagedata, i, j )
         groundVertices.push(i * 0.01, h * 0.005, j * 0.01);
         uvsGround.push(i/(M-1), j/(M-1));
      }
   }

   for (let i = 0; i < M - 1; i++) 
   {
    for (let j = 0; j < M - 1; j++)
      {
         lin_indx0 = i + j * M;
         lin_indx1 = (i + 1) + j * M;
         lin_indx2 = i + (j + 1) * M;
         lin_indx3 = (i + 1) + (j + 1) * M;
         
         groundFaces.push(lin_indx0, lin_indx1, lin_indx3);
         groundFaces.push(lin_indx0, lin_indx3, lin_indx2);
      }
   }

   groundGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( groundVertices, 3 ) );
   groundGeometry.setIndex( groundFaces );

   groundGeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvsGround, 2 ) );
   
   groundGeometry.computeFaceNormals();
   groundGeometry.computeVertexNormals();

   var groundTex = new THREE.TextureLoader().load( 'img/landtile.jpg' );
   groundTex.wrapS = tex.wrapT = THREE.RepeatWrapping;
   groundTex.repeat.set( M, M );

   var groundMat = new THREE.MeshLambertMaterial({
      map:groundTex,
      wireframe: false,
      side:THREE.DoubleSide
   });

   var ground = new THREE.Mesh(groundGeometry, groundMat);
   ground.position.set(0.0, 0.0, 0.0);

   scene.add(ground);
}