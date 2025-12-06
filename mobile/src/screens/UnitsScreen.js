import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import Button from '../components/Button';

const UnitsScreen = ({ navigation }) => {
  const [unitSystem, setUnitSystem] = useState('metric'); // metric or imperial
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
      alert('Units preference saved!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving units:', error);
      alert('Failed to save units preference');
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

      <ScrollView style={styles.content}>
        <Text style={styles.sectionDescription}>
          Choose your preferred unit system for weight and height measurements.
        </Text>

        {/* Metric Option */}
        <TouchableOpacity
          style={[
            styles.unitCard,
            unitSystem === 'metric' && styles.unitCardSelected,
          ]}
          onPress={() => setUnitSystem('metric')}
        >
          <View style={styles.unitCardHeader}>
            <View style={styles.unitCardLeft}>
              <View
                style={[
                  styles.radio,
                  unitSystem === 'metric' && styles.radioSelected,
                ]}
              >
                {unitSystem === 'metric' && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View>
                <Text style={styles.unitSystemName}>
                  {unitOptions.metric.system}
                </Text>
                <Text style={styles.unitSystemDescription}>
                  {unitOptions.metric.description}
                </Text>
              </View>
            </View>
            {unitSystem === 'metric' && (
              <Icon name="check-circle" size={24} color={colors.primary} />
            )}
          </View>

          <View style={styles.unitList}>
            {unitOptions.metric.units.map((unit, index) => (
              <View key={index} style={styles.unitRow}>
                <Text style={styles.unitLabel}>{unit.label}:</Text>
                <Text style={styles.unitValue}>{unit.value}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Imperial Option */}
        <TouchableOpacity
          style={[
            styles.unitCard,
            unitSystem === 'imperial' && styles.unitCardSelected,
          ]}
          onPress={() => setUnitSystem('imperial')}
        >
          <View style={styles.unitCardHeader}>
            <View style={styles.unitCardLeft}>
              <View
                style={[
                  styles.radio,
                  unitSystem === 'imperial' && styles.radioSelected,
                ]}
              >
                {unitSystem === 'imperial' && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View>
                <Text style={styles.unitSystemName}>
                  {unitOptions.imperial.system}
                </Text>
                <Text style={styles.unitSystemDescription}>
                  {unitOptions.imperial.description}
                </Text>
              </View>
            </View>
            {unitSystem === 'imperial' && (
              <Icon name="check-circle" size={24} color={colors.primary} />
            )}
          </View>

          <View style={styles.unitList}>
            {unitOptions.imperial.units.map((unit, index) => (
              <View key={index} style={styles.unitRow}>
                <Text style={styles.unitLabel}>{unit.label}:</Text>
                <Text style={styles.unitValue}>{unit.value}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="information-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            Your unit preference will be applied throughout the app. You can change this anytime.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <Button
          title={saving ? 'Saving...' : 'Save Preference'}
          onPress={saveUnits}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  unitCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  unitCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(19, 236, 91, 0.05)',
  },
  unitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  unitCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  unitSystemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  unitSystemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  unitList: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  unitValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  saveButton: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default UnitsScreen;

