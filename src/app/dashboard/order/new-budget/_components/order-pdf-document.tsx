"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

interface OrderPdfDocumentProps {
  orderId: number;
  customer: {
    customerName: string;
    phone?: string;
    email?: string;
    cpf?: string;
    cnpj?: string;
    address?: string;
    addressNumber?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null;
  items: {
    product: string;
    quantity: number;
    unitValue: string;
    totalValue: string;
  }[];
  summary: {
    subtotalValue: string;
    discountValue: string;
    freightValue: string;
    additionValue: string;
    totalOrderValue: string;
  } | null;
  createdAt?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 24,
    borderBottom: "2px solid #2563eb",
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 16,
    color: "#1f2937",
  },
  customerRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  customerLabel: {
    width: 80,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
  },
  customerValue: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottom: "1px solid #d1d5db",
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
    padding: 6,
    fontSize: 9,
  },
  colProduct: { flex: 4 },
  colQty: { width: 50, textAlign: "center" },
  colUnit: { width: 80, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  summaryContainer: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 220,
    marginBottom: 3,
  },
  summaryLabel: {
    flex: 1,
    color: "#6b7280",
  },
  summaryValue: {
    width: 100,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 220,
    marginTop: 4,
    paddingTop: 6,
    borderTop: "2px solid #2563eb",
  },
  totalLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  totalValue: {
    width: 100,
    textAlign: "right",
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 8,
  },
});

function formatCurrency(value: string | number): string {
  return `R$ ${Number(value).toFixed(2)}`;
}

export function OrderPdfDocument({
  orderId,
  customer,
  items,
  summary,
  createdAt,
}: OrderPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Orçamento #{orderId}</Text>
          <Text style={styles.subtitle}>
            {createdAt ? `Data: ${createdAt}` : "PDV Online"}
          </Text>
        </View>

        {/* Customer */}
        {customer && (
          <View>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>Nome:</Text>
              <Text style={styles.customerValue}>{customer.customerName}</Text>
            </View>
            {customer.phone && (
              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>Telefone:</Text>
                <Text style={styles.customerValue}>{customer.phone}</Text>
              </View>
            )}
            {customer.email && (
              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>E-mail:</Text>
                <Text style={styles.customerValue}>{customer.email}</Text>
              </View>
            )}
            {customer.cpf && (
              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>CPF:</Text>
                <Text style={styles.customerValue}>{customer.cpf}</Text>
              </View>
            )}
            {customer.cnpj && (
              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>CNPJ:</Text>
                <Text style={styles.customerValue}>{customer.cnpj}</Text>
              </View>
            )}
            {customer.address && (
              <View style={styles.customerRow}>
                <Text style={styles.customerLabel}>Endereço:</Text>
                <Text style={styles.customerValue}>
                  {customer.address}
                  {customer.addressNumber && `, ${customer.addressNumber}`}
                  {customer.neighborhood && ` - ${customer.neighborhood}`}
                  {customer.city && `, ${customer.city}`}
                  {customer.state && `/${customer.state}`}
                  {customer.zipCode && ` - ${customer.zipCode}`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Items */}
        <Text style={styles.sectionTitle}>Itens ({items.length})</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colProduct}>Produto</Text>
          <Text style={styles.colQty}>Qtd</Text>
          <Text style={styles.colUnit}>Unitário</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>
        {items.map((item) => (
          <View
            key={`${item.product}-${item.quantity}-${item.unitValue}`}
            style={styles.tableRow}
          >
            <Text style={styles.colProduct}>{item.product}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colUnit}>{formatCurrency(item.unitValue)}</Text>
            <Text style={styles.colTotal}>
              {formatCurrency(item.totalValue)}
            </Text>
          </View>
        ))}

        {/* Summary */}
        {summary && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.subtotalValue)}
              </Text>
            </View>
            {Number(summary.discountValue) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Desconto</Text>
                <Text style={styles.summaryValue}>
                  -{formatCurrency(summary.discountValue)}
                </Text>
              </View>
            )}
            {Number(summary.freightValue) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frete</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(summary.freightValue)}
                </Text>
              </View>
            )}
            {Number(summary.additionValue) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Acréscimo</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(summary.additionValue)}
                </Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(summary.totalOrderValue)}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Pedido #{orderId}</Text>
          <Text>Gerado em {new Date().toLocaleDateString("pt-BR")}</Text>
        </View>
      </Page>
    </Document>
  );
}
