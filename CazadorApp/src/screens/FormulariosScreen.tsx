import React, { useState } from 'react';

import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

export default function FormulariosScreen({ route, navigation }: any) {

    const db = useSQLiteContext();
    const idEdicion = route.params?.idEdicion;
    const tituloEdicion = route.params?.tituloActual || '';
    const califEdicion = route.params?.calificacionActual?.toString() || '';
    const comenEdicion = route.params?.comentariosActuales || '';
    const fotoEdicion = route.params?.fotoActual || '';
    const [titulo, setTitulo] = useState(tituloEdicion);
    const [calificacion, setCalificacion] = useState(califEdicion);
    const [comentarios, setComentarios] = useState(comenEdicion);
    const [fotoBase64, setFotoBase64] = useState(fotoEdicion);
    const abrirCamara = async () => {

        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            return Alert.alert('Permiso requerido', 'Se requiere permiso de cámara para continuar.');
        }

        const resultado = await ImagePicker.launchCameraAsync({

            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: [4, 3],
            base64: true,
            quality: 0.3,
        });

        if (!resultado.canceled && resultado.assets && resultado.assets[0].base64) {

            const base64Uri = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
            setFotoBase64(base64Uri);
        }
    };

    const guardarRegistro = async () => {

        if (!titulo.trim() || !calificacion.trim() || !comentarios.trim() || !fotoBase64) {

            Alert.alert('Campos incompletos', 'Completa todos los campos y toma una fotografía.');
            return;
        }

        const califNum = parseInt(calificacion, 10);

        if (
            isNaN(califNum) || califNum < 1 || califNum > 10
        ) {
            Alert.alert('Calificación inválida', 'Ingresa un número entero entre 1 y 10.');
            return;
        }

        const fechaActual = new Date().toISOString().split('T')[0];

        try {

            if (idEdicion) {
                await db.runAsync(
                    `UPDATE registros SET titulo = ?,calificacion = ?,comentarios = ?,fotoBase64 = ?,fecha = ?WHERE id = ?;`,
                    [
                        titulo,
                        califNum,
                        comentarios,
                        fotoBase64,
                        fechaActual,
                        idEdicion
                    ]
                );

            } else {

                await db.runAsync(`INSERT INTO registros (titulo, calificacion, comentarios, fotoBase64, fecha) VALUES (?, ?, ?, ?, ?);`,
                    [
                        titulo,
                        califNum,
                        comentarios,
                        fotoBase64,
                        fechaActual
                    ]
                );
            }

            Alert.alert(
                "Éxito",
                idEdicion ? "Datos Actualizados" : "Degustación guardada correctamente",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]
            );

        } catch (error) {

            console.error('Error al guardar el registro:', error);

            Alert.alert('Error', 'No se pudo guardar el registro.');
        }
    };

    return (

        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >

            {/* Información */}

            <View style={styles.seccion}>

                <Text style={styles.seccionTitulo}>
                    Información de la degustación
                </Text>

                <Text style={styles.label}>
                    Nombre del plato
                </Text>

                <View style={styles.inputContainer}>

                    <Ionicons
                        name="restaurant-outline"
                        size={20}
                        color="#9A938D"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Ej. Ceviche de camarón"
                        placeholderTextColor="#AAA5A0"
                        value={titulo}
                        onChangeText={setTitulo}
                    />

                </View>

                <Text style={styles.label}>
                    Calificación
                </Text>

                <View style={styles.inputContainer}>

                    <Ionicons
                        name="star-outline"
                        size={20}
                        color="#C69C6D"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Del 1 al 5"
                        placeholderTextColor="#AAA5A0"
                        keyboardType="numeric"
                        maxLength={1}
                        value={calificacion}
                        onChangeText={setCalificacion}
                    />

                    {calificacion && (

                        <Text style={styles.ratingPreview}>
                            {'★'.repeat(
                                Math.min(
                                    Number(calificacion),
                                    5
                                )
                            )}
                        </Text>

                    )}

                </View>

            </View>

          

            {/* Comentarios */}

            <View style={styles.seccion}>

                <Text style={styles.label}>
                    Comentarios
                </Text>

                <View style={[
                    styles.inputContainer,
                    styles.comentariosContainer
                ]}>

                    <Ionicons
                        name="chatbubble-outline"
                        size={20}
                        color="#9A938D"
                        style={styles.iconoComentario}
                    />

                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea
                        ]}
                        placeholder="Describe tu experiencia..."
                        placeholderTextColor="#AAA5A0"
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        value={comentarios}
                        onChangeText={setComentarios}
                    />

                </View>

            </View>

              {/* Fotografía (Movida entre Calificación y Comentarios) */}

            <View style={styles.seccion}>

                <Text style={[styles.label, { marginTop: 15 }]}>
                    Fotografía
                </Text>

                <Text style={styles.seccionDescripcion}>
                    Captura el plato o experiencia que deseas recordar
                </Text>

                <TouchableOpacity
                    style={styles.fotoContainer}
                    activeOpacity={0.85}
                    onPress={abrirCamara}
                >

                    {fotoBase64 ? (

                        <Image
                            source={{ uri: fotoBase64 }}
                            style={styles.imagenPrevia}
                        />

                    ) : (

                        <View style={styles.placeholderFoto}>

                            <View style={styles.iconoCamara}>

                                <Ionicons
                                    name="camera-outline"
                                    size={32}
                                    color="#C69C6D"
                                />

                            </View>

                            <Text style={styles.textoCamara}>
                                Tomar fotografía
                            </Text>

                            <Text style={styles.textoCamaraSecundario}>
                                Toca aquí para abrir la cámara
                            </Text>

                        </View>
                    )}

                    {fotoBase64 && (

                        <View style={styles.indicadorFoto}>

                            <Ionicons
                                name="camera"
                                size={17}
                                color="#FFFFFF"
                            />

                        </View>

                    )}

                </TouchableOpacity>

            </View>

            {/* Botón */}

            <TouchableOpacity
                style={styles.btnGuardar}
                activeOpacity={0.85}
                onPress={guardarRegistro}
            >

                <Ionicons
                    name="checkmark-circle-outline"
                    size={23}
                    color="#FFFFFF"
                />

                <Text style={styles.textoBtnGuardar}>
                    {idEdicion
                        ? 'Actualizar degustación'
                        : 'Guardar degustación'}
                </Text>

            </TouchableOpacity>

            <Text style={styles.nota}>
                Tu experiencia quedará guardada en tu dispositivo.
            </Text>

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#F7F5F2',
        flexGrow: 1,
    },

    seccion: {
        marginTop: 8,
    },

    seccionTitulo: {
        fontSize: 18,
        fontWeight: '800',
        color: '#263238',
        marginBottom: 4,
    },

    seccionDescripcion: {
        fontSize: 13,
        color: '#817A75',
        marginBottom: 14,
    },

    fotoContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E7E1DC',

        shadowColor: '#263238',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,

        elevation: 2,
    },

    imagenPrevia: {
        width: '100%',
        height: '100%',
    },

    placeholderFoto: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    iconoCamara: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F2EAE1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },

    textoCamara: {
        fontSize: 15,
        color: '#4B4541',
        fontWeight: '700',
    },

    textoCamaraSecundario: {
        marginTop: 3,
        color: '#9A938D',
        fontSize: 11,
    },

    indicadorFoto: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#263238',
        justifyContent: 'center',
        alignItems: 'center',
    },

    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A4541',
        marginBottom: 7,
        marginTop: 15,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E1DBD5',
        borderRadius: 12,
        paddingHorizontal: 13,
        minHeight: 52,
    },

    input: {
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 15,
        color: '#263238',
    },

    ratingPreview: {
        color: '#C69C6D',
        fontSize: 14,
        letterSpacing: 1,
    },

    comentariosContainer: {
        alignItems: 'flex-start',
        minHeight: 120,
        paddingTop: 14,
    },

    iconoComentario: {
        marginTop: 2,
    },

    textArea: {
        height: 95,
        paddingTop: 0,
    },

    btnGuardar: {
        backgroundColor: '#263238',
        flexDirection: 'row',
        height: 54,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 28,

        shadowColor: '#263238',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.18,
        shadowRadius: 8,

        elevation: 5,
    },

    textoBtnGuardar: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
        marginLeft: 8,
    },

    nota: {
        textAlign: 'center',
        color: '#9A938D',
        fontSize: 11,
        marginTop: 12,
    },

});