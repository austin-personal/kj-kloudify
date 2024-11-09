// src/utils/loadAwsIcons.ts
export function getAwsIcon(serviceName: string): string {
    const normalizedServiceName = serviceName.toLowerCase().replace(/[\s_]+/g, '-');
    console.log("normalizedServiceName", normalizedServiceName);
    try {
      return require(`../img/aws-icons/${normalizedServiceName}.svg`).default;
    } catch (error) {
      console.warn(`이미지 파일을 찾을 수 없습니다: ${normalizedServiceName}`);
      return require(`../img/aws-icons/default.svg`).default;
    }
  }
  