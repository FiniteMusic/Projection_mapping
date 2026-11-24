
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View
} from "react-native";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import { FileImage, Film } from "lucide-react-native";

import type { MediaAsset } from "@projection/shared";

import { colors } from "@/constants/theme";
import {
  getStoredTokens,
  refreshSession
} from "@/services/auth.service";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface MediaThumbnailProps {
  media: MediaAsset;
}

export default function MediaThumbnail({
  media
}: MediaThumbnailProps) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!API_BASE_URL) {
      return;
    }

    let active = true;

    async function loadThumbnail() {
      setLoading(true);
      setLocalUri(null);

      try {
        const tokens = await getStoredTokens();

        if (!tokens || !active) {
          return;
        }

        const isVideo = media.type === "video";

        const endpoint = isVideo
          ? `/api/media/${media.id}/thumbnail`
          : media.url;

        const extension = isVideo ? "jpg" : "image";

        const destination =
          `${FileSystem.cacheDirectory}${media.id}-thumbnail.${extension}`;

        const download = async (token: string) =>
          FileSystem.downloadAsync(
            `${API_BASE_URL}${endpoint}`,
            destination,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

        let result = await download(tokens.accessToken);

        if (result.status === 401) {
          const latest = await getStoredTokens();

          if (!latest || !active) {
            return;
          }

          const token =
            latest.accessToken !== tokens.accessToken
              ? latest.accessToken
              : (await refreshSession()).tokens.accessToken;

          result = await download(token);
        }

        if (result.status !== 200 || !active) {
          console.warn(
            "[MEDIA] Thumbnail request failed:",
            media.id,
            result.status
          );
          return;
        }

        setLocalUri(result.uri);
      } catch (error) {
        console.error(
          "[MEDIA] Thumbnail download failed:",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadThumbnail();

    return () => {
      active = false;
    };
  }, [media.id, media.type, media.url]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />
      ) : localUri ? (
        <Image
          source={{ uri: localUri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : media.type === "video" ? (
        <Film size={24} color={colors.primary} />
      ) : (
        <FileImage size={24} color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "100%"
  }
});
