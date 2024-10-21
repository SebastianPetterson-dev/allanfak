import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 30 },
    section: { margin: 10 },

});

const FakturaPDF = ({ data }) => (
    <Document>
        <Page style={styles.page}>
            <View style={styles.section}>
                <Text>Navn: {data.name}</Text>

            </View>
        </Page>
    </Document>
);

export default FakturaPDF;