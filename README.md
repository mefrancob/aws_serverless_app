# Aplicación Web Serverless de Gestión de Tareas
Proyecto final para el curso de Computación en la Nube. El objetivo es diseñar, desarrollar y desplegar una aplicación web completa de tipo "To-Do List" utilizando una arquitectura 100% serverless en Amazon Web Services (AWS).

## Descripción del Proyecto
Esta aplicación permite a los usuarios registrarse, iniciar sesión de forma segura y gestionar sus propias listas de tareas. Cada usuario tiene acceso únicamente a sus datos, garantizando la privacidad y el aislamiento. El proyecto abarca todo el ciclo de vida del desarrollo de software en la nube, desde el diseño de la arquitectura y la implementación del frontend y backend, hasta el despliegue automatizado y la configuración de buenas prácticas de seguridad y monitoreo.
El enfoque principal es demostrar la eficiencia, escalabilidad y rentabilidad de las arquitecturas serverless para construir aplicaciones web modernas.
## Arquitectura Tecnológica
La solución se basa en un stack tecnológico serverless nativo de AWS, desacoplando el frontend del backend para maximizar la flexibilidad y la escalabilidad.
### Stack Tecnológico
- **Frontend:** React.js
- **Backend:** Node.js (Funciones AWS Lambda)
- **Infraestructura como Código (IaC):** AWS SAM (Serverless Application Model)
- **Plataforma Cloud:** Amazon Web Services (AWS)
### Servicios Clave de AWS
- **Hosting y Distribución:**
    - **Amazon S3:** Alojamiento de los archivos estáticos del frontend.
    - **Amazon CloudFront:** CDN para entrega de contenido rápida y segura (HTTPS).
- **Cómputo (Backend):**
    - **AWS Lambda:** Ejecución de la lógica de negocio sin gestionar servidores.
- **API y Autenticación:**
    - **Amazon API Gateway:** Exposición de las funciones Lambda como una API RESTful segura.
    - **Amazon Cognito:** Gestión completa del ciclo de vida de usuarios (registro, login, JWT).
- **Base de Datos:**
    - **Amazon DynamoDB:** Base de datos NoSQL, serverless y de alto rendimiento.
 

## Autores

- **Melissa Franco Bernal** - [GitHub: mefrancob](https://github.com/mefrancob)
- **Manuel Tomás Rivera Portilla** - [GitHub: mariverapo](https://github.com/mariverapo)
