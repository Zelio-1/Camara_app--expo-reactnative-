import React, {useState, useEffect, useRef} from "react";
import {View, Text, TouchableOpacity, Image, StyleSheet, Alert} from 'react-native'; 
import {CameraView, useCameraPermissions} from 'expo-camera'; 
import * as ImagePicker from 'expo-image-picker'; 

export default function CameraGalleryApp (){

  //Crera varios states para controlar la app. 

  //States para los permisos
  const [permission, requestPermission] = useCameraPermissions()
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null)

  //State para cambiar la orientacion de la camara (frontal y trasera)
  const [facing, setFacing] = useState('back')

  const [captureImage, setCaptureImage] = useState(null)

  const [showCamera, setShowCamera] = useState(false)

  //State para capturar referencias 
  const cameraRef = useRef(null)

  useEffect(()=>{
    requestGalleryPermission(); 
  }, [/**Las dependecnias van aqui*/]);  

  const requestGalleryPermission = async()=>{ //Es asincrona dado que se requiere que el usuario conteste
    const GalleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync(); 
    setHasGalleryPermission(GalleryStatus.status === 'granted') //Si yo le pongo esto es que es true 

    if (GalleryStatus.status !== 'granted'){
      Alert.alert('Permiso denegado', 'Se necesita el acceso a la galeria para usar esta funcion')
    }
  }
  // Funcion para tomar una foto
  const takePicture = async () =>{
    if(cameraRef.current){
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8, //80% de calidad <Archivo mediano>
        })
        setCaptureImage(photo.uri)
        setShowCamera(false) //Ocultamos la camara
      } catch (error) {
        Alert.alert('Error', 'No se logro tomar la foto')
        console.log(error)
      }
    }
  }


  // Funcion para abrir la galeria
  const pickImageFromGallery = async ()=>{
    if (!hasGalleryPermission){
      Alert.alert('Error', 'No tienes permiso para acceder a la galeria')
      return 
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8
      })

      if(result.canceled){
        setCaptureImage(result.assets[0].uri) //result.assets[0].uri: Primer objeto que se retorna cuando se selecciona una imagen
      }

    } catch (error) {
      Alert.alert('Error', 'No se logro seleccionar la foto')
      console.log(error)
    }
  }

  //Funcion para cambiar la camara: Back -> Front 
  const toggleCameraFacing = ()=>{
    setFacing(current => current === 'back' ? 'Front': 'back')
  }

  if(!permission){
    return(
      <View style={styles.container}>
        <Text>Solicitando permisos...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.txt}>No se ha concedido acceso a la camara</Text>
        <TouchableOpacity
          style={styles.Btn}
          onPress={requestPermission}
        >
          <Text style={styles.btnTxt}>Solicitar acceso a la camara</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if(showCamera){
    return (
      <View style={styles.fullscreen}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraBtnContainer}>
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.cameraBtnTxt}>Voltear</Text>
            </TouchableOpacity>

            {/**Tomar la fotico */}
            
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={takePicture}
              
            >
              <View style={styles.captureBtnInner}/>

            </TouchableOpacity>

            {/**Para cerrar la camara */}
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={()=> setShowCamera(false)}
            >
              <Text style={styles.cameraBtnTxt}>Cerrar</Text>
            </TouchableOpacity>      

            {/** */}

          </View>
        </CameraView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cámara Y galeria</Text>

      {captureImage && (
        //Si tome una foto que muestre la imagen de esa foto
        <Image source={{uri:captureImage}} style={styles.preview}/>
      )}

      <TouchableOpacity
        style={styles.Btn}
        onPress={()=> setShowCamera(true)}
      >
        <Text style={styles.btnTxt}>📷 Abrir Cámara</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.Btn}
        onPress={pickImageFromGallery}
      >
        <Text style={styles.btnTxt}>🖼️ Abrir Galeria</Text>
      </TouchableOpacity>

      {captureImage && (
        <TouchableOpacity
           style={[styles.Btn, styles.clearBtn]}
          onPress={()=> setCaptureImage(null)} // Se borra la foto
        >
          <Text style={styles.btnTxt}>🧹 Limpiar Imagen</Text>
        </TouchableOpacity>
      )}
      
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  }, 
  fullscreen: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333'
  }, 
  text: {
    fontSize: 16, 
    textAlign: 'center',
    marginBottom: 20, 
    color: '#666'
  }, 
  Btn: {
    backgroundColor: '#007AFF', 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 10, 
    marginVertical: 10, 
    minWidth: 200,
    alignItems:'center' 
  }, 
  clearBtn: {
    backgroundColor: '#FF3B30',
  }, 
  btnTxt: {
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
  },
  preview: {
    width: 200,
    height: 300, 
    borderRadius: 10,
    marginBottom: 20, 
  },
  camera: {
    flex: 1
  }, 
  cameraBtnContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent', 
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 40
  }, 
  cameraBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 10
  },
  cameraBtnTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.3)'
  }, 
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff'
  }
})