/**
 * Floor Plan Visualization Component
 * Interactive 2D floor plan showing rooms and IoT device placements
 */

import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Svg, Rect, Circle, Text as SvgText, Line, G } from 'react-native-svg';
import { Shield, Home, Lightbulb, Thermometer, Lock } from 'lucide-react-native';

interface Room {
  id: string;
  name: string;
  roomType: string;
  floor: number;
  length?: number;
  width?: number;
  x?: number;
  y?: number;
}

interface DevicePlacement {
  id: string;
  device: {
    id: string;
    name: string;
    category: string;
  };
  roomId?: string;
  areaId?: string;
  positionX?: number;
  positionY?: number;
  notes?: string;
}

interface FloorPlanProps {
  rooms: Room[];
  areas: any[];
  placements: DevicePlacement[];
  selectedFloor: number;
}

const SCALE = 40; // pixels per meter
const SCREEN_WIDTH = Dimensions.get('window').width - 48;

export function FloorPlanView({ rooms, areas, placements, selectedFloor }: FloorPlanProps) {
  // Calculate layout for rooms
  const layoutRooms = React.useMemo(() => {
    let currentX = 20;
    let currentY = 20;
    let maxHeight = 0;
    const rowWidth = SCREEN_WIDTH - 40;

    return rooms
      .filter((room) => room.floor === selectedFloor)
      .map((room, index) => {
        const width = (room.length || 4) * SCALE;
        const height = (room.width || 3) * SCALE;

        // Wrap to next row if needed
        if (currentX + width > rowWidth && index > 0) {
          currentX = 20;
          currentY += maxHeight + 30;
          maxHeight = 0;
        }

        const positioned = {
          ...room,
          x: currentX,
          y: currentY,
          displayWidth: width,
          displayHeight: height,
        };

        currentX += width + 20;
        maxHeight = Math.max(maxHeight, height);

        return positioned;
      });
  }, [rooms, selectedFloor]);

  const totalHeight = Math.max(
    400,
    layoutRooms.reduce((max, room) => Math.max(max, room.y + room.displayHeight), 0) + 40
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety':
        return '🛡️';
      case 'security':
        return '🔒';
      case 'lighting':
        return '💡';
      case 'climate':
        return '🌡️';
      case 'accessibility':
        return '♿';
      default:
        return '📱';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety':
        return '#EF4444';
      case 'security':
        return '#3B82F6';
      case 'accessibility':
        return '#8B5CF6';
      case 'lighting':
        return '#F59E0B';
      case 'climate':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getRoomColor = (roomType: string) => {
    switch (roomType) {
      case 'bedroom':
        return '#DBEAFE';
      case 'bathroom':
        return '#CFFAFE';
      case 'kitchen':
        return '#FEF3C7';
      case 'living':
        return '#D1FAE5';
      default:
        return '#F3F4F6';
    }
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-6">
      <Text className="text-lg font-bold text-gray-800 mb-4">
        Floor {selectedFloor} Layout
      </Text>

      {/* Legend */}
      <View className="flex-row flex-wrap gap-3 mb-4">
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-red-500 rounded mr-2" />
          <Text className="text-xs text-gray-600">Safety</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-blue-500 rounded mr-2" />
          <Text className="text-xs text-gray-600">Security</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-purple-500 rounded mr-2" />
          <Text className="text-xs text-gray-600">Accessibility</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-amber-500 rounded mr-2" />
          <Text className="text-xs text-gray-600">Lighting</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-green-500 rounded mr-2" />
          <Text className="text-xs text-gray-600">Climate</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Svg width={SCREEN_WIDTH} height={totalHeight}>
            {/* Grid lines */}
            {Array.from({ length: Math.floor(totalHeight / SCALE) }).map((_, i) => (
              <Line
                key={`h-${i}`}
                x1="0"
                y1={i * SCALE}
                x2={SCREEN_WIDTH}
                y2={i * SCALE}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            ))}
            {Array.from({ length: Math.floor(SCREEN_WIDTH / SCALE) }).map((_, i) => (
              <Line
                key={`v-${i}`}
                x1={i * SCALE}
                y1="0"
                x2={i * SCALE}
                y2={totalHeight}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            ))}

            {/* Rooms */}
            {layoutRooms.map((room) => (
              <G key={room.id}>
                {/* Room rectangle */}
                <Rect
                  x={room.x}
                  y={room.y}
                  width={room.displayWidth}
                  height={room.displayHeight}
                  fill={getRoomColor(room.roomType)}
                  stroke="#6B7280"
                  strokeWidth="2"
                  rx="8"
                />

                {/* Room label */}
                <SvgText
                  x={room.x + room.displayWidth / 2}
                  y={room.y + 20}
                  fill="#374151"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {room.name}
                </SvgText>

                {/* Room dimensions */}
                <SvgText
                  x={room.x + room.displayWidth / 2}
                  y={room.y + room.displayHeight - 10}
                  fill="#6B7280"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {room.length && room.width
                    ? `${room.length}m × ${room.width}m`
                    : room.roomType}
                </SvgText>

                {/* Device placements in this room */}
                {placements
                  .filter((p) => p.roomId === room.id)
                  .map((placement, index) => {
                    const deviceX = room.x + 30 + (index % 3) * 40;
                    const deviceY = room.y + 40 + Math.floor(index / 3) * 40;
                    const color = getCategoryColor(placement.device.category);

                    return (
                      <G key={placement.id}>
                        {/* Device circle */}
                        <Circle
                          cx={deviceX}
                          cy={deviceY}
                          r="12"
                          fill={color}
                          opacity="0.9"
                        />

                        {/* Device icon (simplified) */}
                        <Circle cx={deviceX} cy={deviceY} r="4" fill="white" />
                      </G>
                    );
                  })}
              </G>
            ))}
          </Svg>
        </ScrollView>
      </ScrollView>

      {/* Device count per room */}
      <View className="mt-4 pt-4 border-t border-gray-200">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Device Summary:</Text>
        {layoutRooms.map((room) => {
          const deviceCount = placements.filter((p) => p.roomId === room.id).length;
          if (deviceCount === 0) return null;

          return (
            <View key={room.id} className="flex-row items-center justify-between mb-1">
              <Text className="text-sm text-gray-600">{room.name}</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {deviceCount} device{deviceCount !== 1 ? 's' : ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
