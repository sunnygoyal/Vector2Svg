/**
 * Sample Android Vector Drawables for testing and demonstrations.
 * Pure standard JavaScript.
 */

export const SAMPLE_VECTORS = [
  {
    id: 'theme-references',
    title: 'App Badge (Theme References)',
    category: 'References',
    description: 'Demonstrates @color/colorPrimary, @color/accent_coral, and ?attr/colorControlNormal resolution.',
    xml: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="@dimen/badge_size"
    android:height="@dimen/badge_size"
    android:viewportWidth="48"
    android:viewportHeight="48">
    <!-- Outer Shield with primary color reference -->
    <path
        android:name="shield_bg"
        android:fillColor="@color/colorPrimary"
        android:pathData="M24,4 L6,12 L6,22 C6,33.1 13.7,43.4 24,46 C34.3,43.4 42,33.1 42,22 L42,12 L24,4 Z" />
    
    <!-- Inner Accent Crest -->
    <path
        android:name="crest_highlight"
        android:fillColor="@color/accent_coral"
        android:pathData="M24,9 L10,15.2 L10,22 C10,30.8 16,39 24,41.2 C32,39 38,30.8 38,22 L38,15.2 L24,9 Z" />

    <!-- Center Emblem Star with theme control normal attribute -->
    <path
        android:name="star_emblem"
        android:fillColor="?attr/colorControlNormal"
        android:pathData="M24,16 L26.5,21.5 L32.5,22.2 L28,26.4 L29.2,32.3 L24,29.3 L18.8,32.3 L20,26.4 L15.5,22.2 L21.5,21.5 Z" />
</vector>`,
  },
  {
    id: 'bugdroid-mascot',
    title: 'Android Mascot (Bugdroid)',
    category: 'Mascot',
    description: 'Multi-part vector with groups, pivot rotation, antenna angles, and clean Material Green.',
    xml: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="48dp"
    android:height="48dp"
    android:viewportWidth="48"
    android:viewportHeight="48">
    <!-- Antennas & Head -->
    <group
        android:name="head_group"
        android:pivotX="24"
        android:pivotY="15">
        <!-- Left Antenna -->
        <path
            android:name="left_antenna"
            android:fillColor="@color/android_robot_green"
            android:strokeColor="@color/android_robot_green"
            android:strokeWidth="1.5"
            android:strokeLineCap="round"
            android:pathData="M18.5,12 L15.5,7" />
        <!-- Right Antenna -->
        <path
            android:name="right_antenna"
            android:fillColor="@color/android_robot_green"
            android:strokeColor="@color/android_robot_green"
            android:strokeWidth="1.5"
            android:strokeLineCap="round"
            android:pathData="M29.5,12 L32.5,7" />
        <!-- Head Dome -->
        <path
            android:name="head_dome"
            android:fillColor="@color/android_robot_green"
            android:pathData="M14,19 C14,13.5 18.5,9 24,9 C29.5,9 34,13.5 34,19 Z" />
        <!-- Eyes with white reference -->
        <path
            android:name="left_eye"
            android:fillColor="@android:color/white"
            android:pathData="M19,14.5 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0" />
        <path
            android:name="right_eye"
            android:fillColor="@android:color/white"
            android:pathData="M29,14.5 m-1.2,0 a1.2,1.2 0 1,0 2.4,0 a1.2,1.2 0 1,0 -2.4,0" />
    </group>

    <!-- Torso -->
    <path
        android:name="body"
        android:fillColor="@color/android_robot_green"
        android:pathData="M14,21 L34,21 L34,34 C34,35.5 32.5,37 31,37 L17,37 C15.5,37 14,35.5 14,34 Z" />

    <!-- Left Arm -->
    <path
        android:name="left_arm"
        android:fillColor="@color/android_robot_green"
        android:pathData="M9,21 C7.9,21 7,21.9 7,23 L7,31 C7,32.1 7.9,33 9,33 C10.1,33 11,32.1 11,31 L11,23 C11,21.9 10.1,21 9,21 Z" />

    <!-- Right Arm with 15deg pivot rotation -->
    <group
        android:name="waving_right_arm"
        android:pivotX="39"
        android:pivotY="21"
        android:rotation="-15">
        <path
            android:fillColor="@color/android_robot_green"
            android:pathData="M39,21 C37.9,21 37,21.9 37,23 L37,31 C37,32.1 37.9,33 39,33 C40.1,33 41,32.1 41,31 L41,23 C41,21.9 40.1,21 39,21 Z" />
    </group>

    <!-- Legs -->
    <path
        android:name="left_leg"
        android:fillColor="@color/android_robot_green"
        android:pathData="M18,37 L18,43 C18,44.1 18.9,45 20,45 C21.1,45 22,44.1 22,43 L22,37 Z" />
    <path
        android:name="right_leg"
        android:fillColor="@color/android_robot_green"
        android:pathData="M26,37 L26,43 C26,44.1 26.9,45 28,45 C29.1,45 30,44.1 30,43 L30,37 Z" />
</vector>`,
  },
  {
    id: 'gradient-landscape',
    title: 'Sunset Gradient & Sun',
    category: 'Gradients',
    description: 'Linear gradients with aapt:attr syntax and offset color stops.',
    xml: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="64dp"
    android:height="64dp"
    android:viewportWidth="64"
    android:viewportHeight="64">
    <!-- Sky Background with Linear Gradient -->
    <path android:pathData="M0,0 H64 V64 H0 Z">
        <aapt:attr name="android:fillColor">
            <gradient
                android:type="linear"
                android:startX="32"
                android:startY="0"
                android:endX="32"
                android:endY="64">
                <item android:offset="0.0" android:color="#FF0F172A" />
                <item android:offset="0.4" android:color="#FF7C2D12" />
                <item android:offset="0.75" android:color="#FFE11D48" />
                <item android:offset="1.0" android:color="#FFF59E0B" />
            </gradient>
        </aapt:attr>
    </path>

    <!-- Glowing Radiant Sun -->
    <path
        android:name="sun"
        android:pathData="M32,32 m-14,0 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0">
        <aapt:attr name="android:fillColor">
            <gradient
                android:type="radial"
                android:centerX="32"
                android:centerY="32"
                android:gradientRadius="14">
                <item android:offset="0.0" android:color="#FFFFFBEB" />
                <item android:offset="0.6" android:color="#FFFBBF24" />
                <item android:offset="1.0" android:color="#80F59E0B" />
            </gradient>
        </aapt:attr>
    </path>

    <!-- Mountains Silhouette -->
    <path
        android:name="mountain_range"
        android:fillColor="#FF1E1B4B"
        android:pathData="M0,64 L16,42 L28,52 L44,34 L64,54 L64,64 Z" />

    <!-- Foreground Hills with ARGB alpha transparency -->
    <path
        android:name="front_hill"
        android:fillColor="#CC0F172A"
        android:pathData="M0,64 C18,52 38,58 64,50 L64,64 Z" />
</vector>`,
  },
  {
    id: 'weather-clipped',
    title: 'Cloud & Rain (Clip Path)',
    category: 'Clip-Path',
    description: 'Features <clip-path> masking, multiple layered paths, and theme colors.',
    xml: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="48dp"
    android:height="48dp"
    android:viewportWidth="48"
    android:viewportHeight="48">
    <!-- Sun Behind Cloud -->
    <path
        android:name="sun_disc"
        android:fillColor="@color/golden_yellow"
        android:pathData="M24,8 A8,8 0 1,1 18,22 A8,8 0 0,1 24,8 Z" />

    <!-- Group with clip-path restricting rain drops inside lower half -->
    <group android:name="clipped_weather_system">
        <clip-path
            android:name="rain_window"
            android:pathData="M4,24 H44 V48 H4 Z" />
        
        <!-- Rain streaks -->
        <path
            android:name="rain_drop_1"
            android:strokeColor="@color/rain_blue"
            android:strokeWidth="2"
            android:strokeLineCap="round"
            android:pathData="M16,28 L14,38" />
        <path
            android:name="rain_drop_2"
            android:strokeColor="@color/rain_blue"
            android:strokeWidth="2"
            android:strokeLineCap="round"
            android:pathData="M24,28 L22,38" />
        <path
            android:name="rain_drop_3"
            android:strokeColor="@color/rain_blue"
            android:strokeWidth="2"
            android:strokeLineCap="round"
            android:pathData="M32,28 L30,38" />
    </group>

    <!-- Main Fluffy Cloud with semi-transparent shadow -->
    <path
        android:name="cloud_shadow"
        android:fillColor="#33000000"
        android:pathData="M36,25 C36,20.6 32.4,17 28,17 C25.8,17 23.8,17.9 22.4,19.3 C21.4,18.5 20,18 18.5,18 C15.5,18 13,20.5 13,23.5 C13,23.7 13,24 13.1,24.2 C10.2,25.3 8,28.2 8,31.5 C8,35.6 11.4,39 15.5,39 L35.5,39 C39.1,39 42,36.1 42,32.5 C42,29.1 39.4,26.2 36,25 Z" />

    <path
        android:name="cloud_body"
        android:fillColor="@color/cloud_white"
        android:strokeColor="@color/cloud_outline"
        android:strokeWidth="1.5"
        android:strokeLineJoin="round"
        android:pathData="M35,23 C35,19 31.5,16 27.5,16 C25.5,16 23.6,16.8 22.3,18.2 C21.4,17.4 20.1,17 18.7,17 C16,17 13.7,19.2 13.7,22 C13.7,22.2 13.7,22.4 13.8,22.6 C11.1,23.6 9,26.3 9,29.5 C9,33.4 12.1,36.5 16,36.5 L34.5,36.5 C37.8,36.5 40.5,33.8 40.5,30.5 C40.5,27.3 38.1,24.6 35,23 Z" />
</vector>`,
  },
  {
    id: 'material-shopping-cart',
    title: 'E-Commerce Cart (Material Icons)',
    category: 'Material',
    description: 'Clean standard Material Design icon with fill-rule evenodd and stroke cap.',
    xml: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:name="cart_body"
        android:fillColor="@color/cart_primary"
        android:fillType="nonZero"
        android:pathData="M7,18c-1.1,0 -1.99,0.9 -1.99,2S5.9,22 7,22s2,-0.9 2,-2 -0.9,-2 -2,-2zM1,2v2h2l3.6,7.59 -1.35,2.45c-0.16,0.28 -0.25,0.61 -0.25,0.96 0,1.1 0.9,2 2,2h12v-2H7.42c-0.14,0 -0.25,-0.11 -0.25,-0.25l0.03,-0.12 0.9,-1.63h7.45c0.75,0 1.41,-0.41 1.75,-1.03l3.58,-6.49c0.08,-0.14 0.12,-0.31 0.12,-0.48 0,-0.55 -0.45,-1 -1,-1H5.21l-0.94,-2H1zm16,16c-1.1,0 -1.99,0.9 -1.99,2s0.89,2 1.99,2 2,-0.9 2,-2 -0.9,-2 -2,-2z" />
</vector>`,
  },
];
