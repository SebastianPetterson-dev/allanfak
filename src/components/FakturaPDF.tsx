import React from 'react';
import type { FormDataType } from './formdatatype';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { margin: 10 },
});

interface FakturaPDFProps {
  data: FormDataType;
}

const FakturaPDF: React.FC<FakturaPDFProps> = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text>Navn: {data.name}</Text>
        {/* Andre datafelter */}
      </View>
    </Page>
  </Document>
);

export default FakturaPDF;
