import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, spacing, shadows, typography } from '@theme/index';
import { Unit } from '@types/unit.types';

interface PropertyCardProps {
  unit: Unit;
  onPress: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ unit, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, shadows.md]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {unit.images && unit.images.length > 0 && (
        <Image
          source={{ uri: unit.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {unit.unitNumber}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{unit.status}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.detailText}>
            {unit.bedrooms} Beds • {unit.bathrooms} Baths
          </Text>
          <Text style={styles.detailText}>{unit.area} m²</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            ${unit.pricing.rentPrice}/{unit.pricing.billingCycle}
          </Text>
          <Text style={styles.location}>{unit.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.gray200,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h6,
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
  },
  details: {
    marginBottom: spacing.md,
  },
  detailText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  price: {
    ...typography.h6,
    color: colors.primary,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
