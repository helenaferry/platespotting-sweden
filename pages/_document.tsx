import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.2/dist/leaflet.css"
                    integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14="
                    crossOrigin="" />
                <script src="https://unpkg.com/leaflet@1.9.2/dist/leaflet.js"
                    integrity="sha256-o9N1jGDZrf5tS+Ft4gbIK7mYMipq9lqpVJ91xHSyKhg="
                    crossOrigin=""></script>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}