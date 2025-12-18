import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import Button from '../components/Button';

const UnitsScreen = ({ navigation }) => {
  const [unitSystem, setUnitSystem] = useState('metric');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const savedUnits = await AsyncStorage.getItem('unitSystem');
      if (savedUnits) {
        setUnitSystem(savedUnits);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const saveUnits = async () => {
    try {
      setSaving(true);
      await AsyncStorage.setItem('unitSystem', unitSystem);
      // Previously this used alert() for debug feedback; keep it silent now.
      navigation.goBack();
    } catch (error) {
      console.error('Error saving units:', error);
    } finally {
      setSaving(false);
    }
  };

  const unitOptions = {
    metric: {
      system: 'Metric',
      description: 'Used in most countries',
      units: [
        { label: 'Weight', value: 'Kilograms (kg)' },
        { label: 'Height', value: 'Centimeters (cm)' },
      ],
    },
    imperial: {
      system: 'Imperial',
      description: 'Used in US, UK',
      units: [
        { label: 'Weight', value: 'Pounds (lbs)' },
        { label: 'Height', value: 'Feet & Inches (ft, in)' },
      ],
    },
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Units</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Choose your preferred unit system</Text>

        {Object.entries(unitOptions).map(([key, option]) => {
          const isSelected = unitSystem === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setUnitSystem(key)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Icon
                    name={key === 'metric' ? 'ruler-square' : 'ruler'}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{option.system}</Text>
                  <Text style={styles.cardSubtitle}>{option.description}</Text>
                </View>
                {isSelected && (
                  <Icon name="check-circle" size={22} color={colors.primary} />
                )}
              </View>

              <View style={styles.unitList}>
                {option.units.map((u) => (
                  <View key={u.label} style={styles.unitRow}>
                    <Text style={styles.unitLabel}>{u.label}</Text>
                    <Text style={styles.unitValue}>{u.value}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={saving ? 'Saving...' : 'Save'}
          onPress={saveUnits}
          loading={saving}
          disabled={saving}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(19, 236, 91, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unitList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  unitLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  unitValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.cardBg,
  },
});

export default UnitsScreen;


